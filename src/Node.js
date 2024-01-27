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

function getString(json) {
  let result = '';
  const type = typeof json;
  if (type === 'object') {
    if (Array.isArray(json)) {
      for (let i = 0; i < json.length; i++) {
        result += getString(json[i]);
      }
    } else {
      for (const key of Object.keys(json)) {
        result += getString(json[key]);
      }
    }
  } else if (type === 'string') {
    result = json;
  } else {
    result = JSON.stringify(json);
  }
  return result;
}

function getNumber(json) {
  switch (typeof json) {
    case 'number': return json;
    case 'string': return json.length === 0 ? NaN : Number(json);
    case 'boolean': return Number(json);
    default: return getNumber(getString(json));
  }
}

class Node {
  constructor(parent, name, json) {
    this.parent = parent;
    this.name = name;
    this.json = json;
  }

  getRoot() {
    return this.parent === null ? this : this.parent.getRoot();
  }

  getParent() {
    return this.parent;
  }

  getJson() {
    return this.json;
  }

  getNumber() {
    return getNumber(this.json);
  }

  getBoolean() {
    return Boolean(this.json);
  }

  getString() {
    return getString(this.getJson());
  }

  compareJsonPrimitiv(json, val, relation) {
    switch (typeof val) {
      case 'string': return relation(getString(json), val);
      case 'number': return relation(getNumber(json), val);
      case 'boolean': return relation(Boolean(json), val);
      default:
        throw new Error(`Node.compareJsonPrimitiv this ${typeof json} val ${typeof val}`);
    }
  }

  compareEquality(val, relation) {
    const nonPrimitive = (val) => typeof val === 'object' || Array.isArray(val);
    const leftNonPrimitiv = nonPrimitive(this.json);
    const rightNonPrimitive = nonPrimitive(val);
    if (leftNonPrimitiv && rightNonPrimitive) {
      return relation(this.getString(), val.getString());
    } else if (leftNonPrimitiv) {
      return this.compareJsonPrimitiv(this.json, val, relation);
    } else {
      return this.compareJsonPrimitiv(val, this.json, relation);
    }
  }

  getLocalName() {
    return this.name;
  }

  getAncestors() {
    const result = [];
    let parent = this.parent;
    while (parent != null) {
      result.push(parent);
      parent = parent.getParent();
    }
    return result;
  }

  toString() {
    return `<${this.name}>${this.json}</${this.name}>`;
  }
}

class LeafNode extends Node {
  getChild() {
    return [];
  }

  getSubTreeNodes() {
    return [];
  }

  search(name) {
    return [];
  }
}

class ObjectNode extends Node {
  getChild(name) {
    this.instantiateChildren();
    return this.children.filter((n) => n.getLocalName() === name);
  }

  getChildren() {
    this.instantiateChildren();
    return this.children;
  }

  getSubTreeNodes() {
    const r1 = this.getChildren();
    const r2 = r1.map((n) => n.getSubTreeNodes()).flat();
    return r1.concat(r2);
  }

  search(name) {
    const r1 = this.getChild(name);
    const r2 = this.getChildren().map((n) => n.search(name)).flat();
    return r1.concat(r2);
  }

  addChildNode(name, json) {
    if (Array.isArray(json)) {
      for (let i = 0; i < json.length; i++) {
        this.children.push(new ArrayNode(this, name, json, i));
      }
    } else if (typeof json === 'object') {
      this.children.push(new ObjectNode(this, name, json));
    } else {
      this.children.push(new LeafNode(this, name, json));
    }
  }

  instantiateChildren() {
    if (this.children === undefined) {
      this.children = [];
      const json = this.getJson();
      for (const key of Object.keys(json)) {
        this.addChildNode(key, json[key]);
      }
    }
  }
}

class ArrayNode extends ObjectNode {
  constructor(parent, name, json, i) {
    super(parent, name, json);
    this.i = i;
  }

  getJson() {
    return this.json[this.i];
  }
}

exports.ObjectNode = ObjectNode;
