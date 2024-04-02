// MIT license
//
// Copyright 2024 Per Nilsson
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the “Software”), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.

const Value = require('./Value').Value;

// Utility functions
function addIfUnique(resultSet, nodeSet) {
  for (let i = 0; i < nodeSet.length; i++) {
    const node = nodeSet[i];
    if (!resultSet.find((n) => n === node)) {
      resultSet.push(node);
    }
  }
}

function checkLocalName(node, name) {
  return name.length === 0 || name === '*' || node.getLocalName() === name;
}

// Expression classes
class Expr {
  constructor() {
    this.preds = [];
  }

  eval(env, val, pos, firstStep) {
    if (this.preds.length === 0) {
      return this.evalExpr(env, val, pos, firstStep);
    } else {
      const v = this.evalExpr(env, val, pos, firstStep);
      return this.evalFilter(env, v);
    }
  }

  evalExpr(env, val, pos, firstStep) {
    throw new Error('Exp.evalExpr implement in subclasses');
  }

  addPredicates(preds) {
    this.preds = preds;
  }

  takePredicates() {
    const result = this.preds;
    this.preds = [];
    return result;
  }

  evalFilter(env, val) {
    if (val.getType() !== 'nodeset') {
      const keep = this.preds.reduce((acc, pred) => {
        const v = pred.eval(env, val, 0, false);
        acc &= v.getBoolean();
        return acc;
      }, true);
      return keep ? val : new Value([]);
    }
    let nodes = val.getNodeSet();
    for (let i = 0; i < this.preds.length; i++) {
      const tmp = [];
      for (let j = 0; j < nodes.length; j++) {
        const r = this.preds[i].eval(env, new Value(nodes), j, false);
        if (r.getType() === 'number') {
          if (j + 1 === r.getNumber()) {
            tmp.push(nodes[j]);
          }
        } else if (r.getBoolean()) {
          tmp.push(nodes[j]);
        }
      }
      nodes = tmp;
    }
    return new Value(nodes);
  }
}

class BinaryExpr extends Expr {
  constructor(left, right, operator, accessor) {
    super();
    this.left = left;
    this.right = right;
    this.operator = operator;
    this.accessor = accessor;
  }

  evalExpr(env, val, pos, firstStep) {
    const l = this.left.eval(env, val, pos, firstStep);
    const r = this.right.eval(env, val, pos, firstStep);
    return new Value(this.operator(this.accessor(l), this.accessor(r)));
  }
}

class StrExpr extends Expr {
  constructor(s) {
    super();
    this.s = s;
  }

  getString() {
    return this.s;
  }
}

class MultiExpr extends Expr {
  constructor(step) {
    super();
    // TODO: can step be null ?
    this.exps = [step];
  }

  addFront(exp) {
    this.exps.unshift(exp);
  }

  addBack(exp) {
    this.exps.push(exp);
  }
}

class Path extends MultiExpr {
  evalExpr(env, val, pos, firstStep) {
    let result = val;
    for (let i = 0; i < this.exps.length; i++) {
      result = this.exps[i].eval(env, result, pos, i === 0);
    }
    return result;
  }

  createDescendant() {
    // The grammar ensures there is at least one step
    const step = this.exps[0];
    let descendant;
    if (Step.isAllStep(step)) {
      descendant = new DescendantAll();
      descendant.addPredicates(step.takePredicates());
      this.exps.shift();
    } else if (Step.isSelfOrParentStep(step)) {
      descendant = new DescendantAll();
    } else {
      descendant = new DescendantSearch(step.s);
      descendant.addPredicates(step.takePredicates());
      this.exps.shift();
    }
    return descendant;
  }

  addAbsoluteDescendant() {
    this.exps.unshift(this.createDescendant());
    this.exps.unshift(new Root());
  }

  addRelativeDescendant(step) {
    let descendant;
    if (Step.isAllStep(step)) {
      descendant = new DescendantAll();
      descendant.addPredicates(step.takePredicates());
    } else if (Step.isSelfOrParentStep(step)) {
      descendant = new DescendantAll();
    } else {
      descendant = new DescendantSearch(step.s);
      descendant.addPredicates(step.takePredicates());
    }
    this.exps.push(descendant);
  }
}

class Root extends Expr {
  evalExpr(env, val, pos, firstStep) {
    return env.getRoot();
  }
}

class Step extends StrExpr {
  static create(axisName, nodeTest) {
    switch (axisName) {
      case '' : {
        switch (nodeTest) {
          case '..': return new ParentStep();
          case '.': return new SelfStep();
          case '*': return new AllStep();
          default: return new ChildStep(nodeTest);
        }
      }
      case 'ancestor': return new AncestorStep(nodeTest);
      case 'ancestor-or-self' : return new AncestorSelfStep(nodeTest);
      case 'child' : {
        return nodeTest === '*' ? new AllStep() : new ChildStep(nodeTest);
      }
      case 'descendant' : {
        return nodeTest === '*' ? new DescendantAll() : new DescendantSearch(nodeTest);
      }
      case 'descendant-or-self' : {
        return nodeTest === '*'
          ? new DescendantOrSelfAll()
          : new DescendantOrSelfSearch(nodeTest);
      }
      case 'following-sibling': {
        return nodeTest === '*'
          ? new FollowingSiblingAll()
          : new FollowingSiblingSearch(nodeTest);
      }
      case 'parent': {
        return nodeTest === '*' ? new ParentStep() : new ParentMatchStep(nodeTest);
      }
      case 'self': {
        return nodeTest === '*' ? new SelfStep() : new SelfMatchStep(nodeTest);
      }
      default:
        throw new Error('Step.create not a supported step');
    }
  }

  static isAllStep(step) {
    return step.constructor.name === 'AllStep';
  }

  static isSelfOrParentStep(step) {
    const n = step.constructor.name;
    return n === 'SelfStep' || n === 'SelfMatchStep' ||
      n === 'ParenStep' || n === 'ParentMatchStep';
  }
}

class AllStep extends Expr {
  evalExpr(env, val, pos, firstStep) {
    const nodeSet = val.getNodeSet();
    if (firstStep) {
      return new Value(nodeSet[pos].getChildren());
    } else {
      return new Value(nodeSet.map((n) => n.getChildren()).flat());
    }
  }
}

class AncestorStep extends Step {
  getNodes(env, val, pos, firstStep) {
    const nodeSet = val.getNodeSet();
    let tmp1;
    if (firstStep) {
      tmp1 = nodeSet[pos].getAncestors();
    } else {
      tmp1 = [];
      for (let i = 0; i < nodeSet.length; i++) {
        const tmp2 = nodeSet[i].getAncestors();
        addIfUnique(tmp1, tmp2);
      }
    }
    return tmp1;
  }

  filterNodes(nodes) {
    let result;
    if (this.s !== '*') {
      result = nodes.filter((n) => n.getLocalName() === this.s);
    } else {
      result = nodes;
    }
    return new Value(result);
  }

  evalExpr(env, val, pos, firstStep) {
    const ancestorNodes = this.getNodes(env, val, pos, firstStep);
    return this.filterNodes(ancestorNodes);
  }
}

class AncestorSelfStep extends AncestorStep {
  evalExpr(env, val, pos, firstStep) {
    const ancestorNodes = this.getNodes(env, val, pos, firstStep);
    const selfNodes = SelfStep.getNodes(env, val, pos, firstStep);
    return this.filterNodes(selfNodes.concat(ancestorNodes));
  }
}

class ParentMatchStep extends Step {
  evalExpr(env, val, pos, firstStep) {
    const nodeSet = val.getNodeSet();
    const result = [];
    if (firstStep) {
      const nodeSet = val.getNodeSet();
      const parent = nodeSet[pos].getParent();
      if (parent !== null && checkLocalName(parent, this.s)) {
        result.push(result);
      }
    } else {
      for (let i = 0; i < nodeSet.length; i++) {
        const parent = nodeSet[i].getParent();
        if (parent !== null && checkLocalName(parent, this.s)) {
          if (!result.find((n) => n === parent)) {
            result.push(parent);
          }
        }
      }
    }
    return new Value(result);
  }
}

class ChildStep extends Step {
  evalExpr(env, val, pos, firstStep) {
    const nodeSet = val.getNodeSet();
    let result;
    if (firstStep) {
      const n = nodeSet[pos];
      result = n.getChild(this.s);
    } else {
      result = nodeSet.map((n) => n.getChild(this.s)).flat();
    }
    return new Value(result);
  }
}

class ParentStep extends Expr {
  evalExpr(env, val, pos, firstStep) {
    const nodeSet = val.getNodeSet();
    const result = [];
    if (firstStep) {
      result.push(nodeSet[pos].getParent());
    } else {
      for (let i = 0; i < nodeSet.length; i++) {
        const parent = nodeSet[i].getParent();
        // Add parent if not allready added
        if (!result.find((n) => n === parent)) {
          result.push(parent);
        }
      }
    }
    return new Value(result);
  }
}

class SelfStep extends Expr {
  static getNodes(env, val, pos, firstStep) {
    const nodeSet = val.getNodeSet();
    let result = [];
    if (firstStep) {
      result = [nodeSet[pos]];
    } else {
      result = nodeSet;
    }
    return result;
  }

  evalExpr(env, val, pos, firstStep) {
    if (val.getType() !== 'nodeset') {
      return val;
    }
    return new Value(SelfStep.getNodes(env, val, pos, firstStep));
  }
}

class SelfMatchStep extends Step {
  evalExpr(env, val, pos, firstStep) {
    if (val.getType() !== 'nodeset') {
      return new Value([]);
    }
    const nodeSet = val.getNodeSet();
    const result = [];
    if (firstStep) {
      const n = nodeSet[pos];
      if (checkLocalName(n, this.s)) { // TODO checks to much probably
        result.push(n);
      }
    } else {
      for (let i = 0; i < nodeSet.length; i++) {
        const n = nodeSet[i];
        if (n.getLocalName() === this.s) {
          result.push(n);
        }
      }
    }
    return new Value(result);
  }
}

class Predicate extends Expr {
  constructor(expr) {
    super();
    this.expr = expr;
  }

  evalExpr(env, val, pos, firstStep) {
    return this.expr.eval(env, val, pos, firstStep);
  }
}

class DescendantAll extends Expr {
  evalExpr(env, val, pos, firstStep) {
    const nodeSet = val.getNodeSet();
    return new Value(nodeSet.map((n) => n.getSubTreeNodes()).flat());
  }
}

class DescendantSearch extends Step {
  evalExpr(env, val, pos, firstStep) {
    const nodeSet = val.getNodeSet();
    return new Value(nodeSet.map((n) => n.search(this.s)).flat());
  }
}

class DescendantOrSelfAll extends Step {
  evalExpr(env, val, pos, firstStep) {
    const nodeSet = val.getNodeSet();
    const selfNodes = nodeSet.filter((n) => n.getLocalName() !== ''); // skip root node
    const searchNodes = nodeSet.map((n) => n.getSubTreeNodes()).flat();
    return new Value(selfNodes.concat(searchNodes));
  }
}

class DescendantOrSelfSearch extends Step {
  evalExpr(env, val, pos, firstStep) {
    const nodeSet = val.getNodeSet();
    const selfNodes = nodeSet.filter((n) => n.getLocalName() === this.s);
    const subTreeNodes = nodeSet.map((n) => n.search(this.s)).flat();
    return new Value(selfNodes.concat(subTreeNodes));
  }
}

class Fun extends Expr {
  constructor(args) {
    super();
    this.args = args;
  }

  static create(name, args) {
    switch (name) {
      case 'current': return new CurrentFun(name, args);
      case 'last': return new LastFun(name, args);
      case 'position': return new PositionFun(name, args);
      case 'count': return new CountFun(name, args);
      case 'local-name': return new LocalNameFun(name, args);
      case 'string': return new StringFun(name, args);
      case 'concat': return new ConcatFun(name, args);
      case 'starts-with': return new StartsWithFun(name, args);
      case 'contains': return new ContainsFun(name, args);
      case 'substring-before': return new SubstringBeforeFun(name, args);
      case 'substring-after': return new SubstringAfterFun(name, args);
      case 'substring': return new SubstringFun(name, args);
      case 'string-length': return new StringLengthFun(name, args);
      case 'translate': return new TranslateFun(name, args);
      case 'number': return new NumberFun(name, args);
      case 'sum': return new SumFun(name, args);
      case 'floor': return new FloorFun(name, args);
      case 'ceiling': return new CeilingFun(name, args);
      case 'round': return new RoundFun(name, args);
      case 'boolean': return new BooleanFun(name, args);
      case 'not': return new NotFun(name, args);
      case 'true': return new TrueFun(name, args);
      case 'false': return new FalseFun(name, args);
      default:
        throw new Error(`Fun::eval unkown function: ${name}`);
    }
  }

  checkArgs(name, expectedSize) {
    if (this.args.length !== expectedSize) {
      const m = `Fun.checkArgs got ${this.args.length} expected ${expectedSize}in ${name}`;
      throw new Error(m);
    }
  }

  checkArgsZeroOrOne(name) {
    if (this.args.length > 1) {
      throw new Error(`Fun.checkArgsZeroOrOne got ${this.args.length} in ${name}`);
    }
  }

  checkArgsGe(name, expectedSize) {
    if (this.args.length < expectedSize) {
      throw new Error(`Fun.checkArgsGe ${this.args.length} < ${expectedSize} in ${name}`);
    }
  }

  checkArgsTwoOrThree(name) {
    if (!(this.args.length === 2 || this.args.length === 3)) {
      throw new Error(`Fun.checkArgsTwoOrThree ${this.args.length} should be 2 or 3`);
    }
  }
}

class CurrentFun extends Fun {
  constructor(name, args) {
    super(args);
    this.checkArgs(name, 0);
  }

  evalExpr(env, val, pos, firstStep) {
    return env.getCurrent();
  }
}

class LastFun extends Fun {
  constructor(name, args) {
    super(args);
    this.checkArgs(name, 0);
  }

  evalExpr(env, val, pos, firstStep) {
    return new Value(val.getNodeSet().length);
  }
}

class PositionFun extends Fun {
  constructor(name, args) {
    super(args);
    this.checkArgs(name, 0);
  }

  evalExpr(env, val, pos, firstStep) {
    return new Value(pos + 1);
  }
}

class CountFun extends Fun {
  constructor(name, args) {
    super(args);
    this.checkArgs(name, 1);
  }

  evalExpr(env, val, pos, firstStep) {
    const v = this.args[0].eval(env, val, pos, firstStep);
    return v.getNodeSetSize();
  }
}

class LocalNameFun extends Fun {
  constructor(name, args) {
    super(args);
    this.checkArgsZeroOrOne(name);
  }

  evalExpr(env, val, pos, firstStep) {
    if (this.args.length === 0) {
      const node = val.getNode(pos);
      return node.getLocalName();
    } else {
      const v = this.args[0].eval(env, val, pos, firstStep);
      return v.getLocalName();
    }
  }
}

// String functions
class StringFun extends Fun {
  constructor(name, args) {
    super(args);
    this.checkArgsZeroOrOne(name);
  }

  evalExpr(env, val, pos, firstStep) {
    if (this.args.length === 0) {
      const node = val.getNode(pos);
      return new Value([node]);
    } else {
      const v = this.args[0].eval(env, val, pos, false);
      return new Value(v.getString());
    }
  }
}

class ConcatFun extends Fun {
  constructor(name, args) {
    super(args);
    this.checkArgsGe(name, 2);
  }

  evalExpr(env, val, pos, firstStep) {
    const result = this.args.reduce((acc, arg) => {
      const v = arg.eval(env, val, pos, firstStep);
      return acc + v.getString();
    }, '');
    return new Value(result);
  }
}

class StartsWithFun extends Fun {
  constructor(name, args) {
    super(args);
    this.checkArgs(name, 2);
  }

  evalExpr(env, val, pos, firstStep) {
    const first = this.args[0].eval(env, val, pos, firstStep);
    const second = this.args[1].eval(env, val, pos, firstStep);
    const result = first.getString().startsWith(second.getString());
    return new Value(result);
  }
}

class ContainsFun extends Fun {
  constructor(name, args) {
    super(args);
    this.checkArgs(name, 2);
  }

  evalExpr(env, val, pos, firstStep) {
    const first = this.args[0].eval(env, val, pos, firstStep);
    const second = this.args[1].eval(env, val, pos, firstStep);
    const result = first.getString().search(second.getString());
    return new Value(result !== -1);
  }
}

class SubstringBeforeFun extends Fun {
  constructor(name, args) {
    super(args);
    this.checkArgs(name, 2);
  }

  evalExpr(env, val, pos, firstStep) {
    const first = this.args[0].eval(env, val, pos, firstStep).getString();
    const second = this.args[1].eval(env, val, pos, firstStep).getString();
    const index = first.search(second);
    return new Value(first.substring(0, index));
  }
}

class SubstringAfterFun extends Fun {
  constructor(name, args) {
    super(args);
    this.checkArgs(name, 2);
  }

  evalExpr(env, val, pos, firstStep) {
    const first = this.args[0].eval(env, val, pos, firstStep).getString();
    const second = this.args[1].eval(env, val, pos, firstStep).getString();
    const index = first.search(second);
    return new Value(first.substring(index + second.length, first.length));
  }
}

class SubstringFun extends Fun {
  constructor(name, args) {
    super(args);
    this.checkArgsTwoOrThree(name);
  }

  evalExpr(env, val, pos, firstStep) {
    const str = this.args[0].eval(env, val, pos, firstStep).getString();
    let position = this.args[1].eval(env, val, pos, firstStep).getNumber();
    if (!Number.isFinite(position)) {
      return new Value('');
    }
    let diff = null;            // how much to remove from length if position < 1
    if (position < 1) {
      diff = 1 - position;
      position = 1;
    }
    let argSize = this.args.length;
    let len;
    if (argSize === 3) {
      len = this.args[2].eval(env, val, pos, firstStep).getNumber();
      if (Number.isNaN(len) || len < 1) {
        return new Value('');
      }
      if (!Number.isFinite(len)) {
        argSize = 2;
      } else if (diff) {
        len -= diff;            // position is before start of string so adjust len
      }
    }
    let result;
    if (argSize === 2) {
      result = str.substring(Math.round(position - 1));
    } else {
      result = str.substring(Math.round(position - 1), Math.round(position - 1 + len));
    }
    return new Value(result);
  }
}

// Number functions
class NumberFun extends Fun {
  constructor(name, args) {
    super(args);
    this.checkArgsZeroOrOne(name);
  }

  evalExpr(env, val, pos, firstStep) {
    if (this.args.length === 0) {
      const node = val.getNode(pos);
      return new Value(node.getNumber());
    } else {
      const v = this.args[0].eval(env, val, pos, firstStep);
      return new Value(v.getNumber());
    }
  }
}

class SumFun extends Fun {
  constructor(name, args) {
    super(args);
    this.checkArgs(name, 1);
  }

  evalExpr(env, val, pos, firstStep) {
    const v = this.args[0].eval(env, val, pos, firstStep);
    let result = 0;
    const nodes = v.getNodeSet();
    for (let i = 0; i < nodes.length; i++) {
      const s = nodes[i].getString();
      if (s.length === 0) {
        result = NaN;
        break;
      } else {
        result += Number(s);
      }
    }
    return new Value(result);
  }
}

class FloorFun extends Fun {
  constructor(name, args) {
    super(args);
    this.checkArgs(name, 1);
  }

  evalExpr(env, val, pos, firstStep) {
    const v = this.args[0].eval(env, val, pos, firstStep);
    return new Value(Math.floor(v.getNumber()));
  }
}

class CeilingFun extends Fun {
  constructor(name, args) {
    super(args);
    this.checkArgs(name, 1);
  }

  evalExpr(env, val, pos, firstStep) {
    const v = this.args[0].eval(env, val, pos, firstStep);
    return new Value(Math.ceil(v.getNumber()));
  }
}

class RoundFun extends Fun {
  constructor(name, args) {
    super(args);
    this.checkArgs(name, 1);
  }

  evalExpr(env, val, pos, firstStep) {
    const v = this.args[0].eval(env, val, pos, firstStep);
    return new Value(Math.round(v.getNumber()));
  }
}

class BooleanFun extends Fun {
  constructor(name, args) {
    super(args);
    this.checkArgsZeroOrOne(name, 1);
  }

  evalExpr(env, val, pos, firstStep) {
    if (this.args.length === 0) {
      const n = val.getNode(pos);
      return new Value(n.getBoolean());
    } else {
      const v = this.args[0].eval(env, val, pos, firstStep);
      return new Value(v.getBoolean());
    }
  }
}

class NotFun extends Fun {
  constructor(name, args) {
    super(args);
    this.checkArgs(name, 1);
  }

  evalExpr(env, val, pos, firstStep) {
    const v = this.args[0].eval(env, val, pos, firstStep);
    return new Value(!v.getBoolean());
  }
}

class TrueFun extends Fun {
  constructor(name, args) {
    super(args);
    this.checkArgs(name, 0);
  }

  evalExpr(env, val, pos, firstStep) {
    return new Value(true);
  }
}

class FalseFun extends Fun {
  constructor(name, args) {
    super(args);
    this.checkArgs(name, 0);
  }

  evalExpr(env, val, pos, firstStep) {
    return new Value(false);
  }
}

class StringLiteral extends StrExpr {
  evalExpr(env, val, pos, firstStep) {
    return new Value(this.s);
  }
}

class NumericLiteral extends Expr {
  constructor(num) {
    super();
    this.num = num;
  }

  evalExpr(env, val, pos, firstStep) {
    return new Value(this.num);
  }
}

exports.BinaryExpr = BinaryExpr;
exports.Path = Path;
exports.Root = Root;
exports.Predicate = Predicate;
exports.createStep = Step.create;
exports.createFunction = Fun.create;
exports.StringLiteral = StringLiteral;
exports.NumericLiteral = NumericLiteral;
