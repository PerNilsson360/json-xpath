const Value = require('./Value').Value;

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
      case 'contains': return new StartsWithFun(name, args);
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
exports.createStep = Step.create;
exports.createFunction = Fun.create;
exports.StringLiteral = StringLiteral;
exports.NumericLiteral = NumericLiteral;
