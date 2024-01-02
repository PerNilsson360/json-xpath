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

class Node {
  constructor(parent, name, json) {
    this.parent = parent;
    this.name = name;
    this.json = json;
  }

  getRoot() {
    return this.parent === null ? this : this.parent.getRoot();
  }

  getJson() {
    return this.json;
  }

  getNumber() {
    const j = this.getJson();
    const t = typeof j;
    switch (t) {
      case 'number': return j;
      case 'string': return j.length === 0 ? NaN : Number(j);
      case 'boolean': return Number(j);
      default: return NaN;
    }
  }

  getString() {
    return getString(this.getJson());
  }

  getLocalName() {
    return this.name;
  }
}

class LeafNode extends Node {
}

class ObjectNode extends Node {
  getChild(name) {
    this.instantiateChildren();
    return this.children.filter((n) => n.getLocalName() === name);
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
      for (const key of Object.keys(this.json)) {
        this.addChildNode(key, this.json[key]);
      }
    }
  }
}

class ArrayNode extends Node {
  constructor(parent, name, json, i) {
    super(parent, name, json);
    this.i = i;
  }

  getJson() {
    return this.json[this.i];
  }
}

exports.ObjectNode = ObjectNode;
