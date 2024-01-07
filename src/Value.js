const ObjectNode = require('./Node').ObjectNode;

class Value {
  constructor(val) {
    this.val = val;
  }

  static fromPrimitive(val) {
    if (typeof val === 'object') {
      throw new Error('Value.fromPrimitive : val is not a primitive type');
    }
    return new Value(val);
  }

  static fromJsonString(str) {
    const val = JSON.parse(str);
    if (typeof val === 'object') {
      return new Value([new ObjectNode(null, '', val)]);
    }
    return new Value(val);
  }

  getType() {
    const t = typeof this.val;
    return t === 'object' ? 'nodeset' : t;
  }

  getVal() {
    return this.val;
  }

  getNumber() {
    const type = this.getType();
    switch (type) {
      case 'number':
        return this.val;
      case 'boolean':
        return Number(this.val);
      case 'string':
        return this.val.length === 0 ? NaN : Number(this.val);
      case 'nodeset': {
        const s = this.getString();
        return s.length === 0 ? NaN : Number(s);
      }
      default:
        throw new Error(`Value.getNumber() not a suported type ${type}`);
    }
  }

  getBoolean() {
    const type = this.getType();
    switch (type) {
      case 'number': return !(this.val === 0 || Number.isNaN(this.val));
      case 'boolean': return this.val;
      case 'string': return this.val.length !== 0;
      case 'nodeset':
        return this.val.length !== 0;
      default:
        throw new Error(`Value.getBoolean() not a suported type ${type}`);
    }
  }

  /**
   * Primitiv values are converted to strings. For node sets the "string value"
   * of the first node is returned. If the node set is empty the empty string is
   * returned.
   * @return a string representation of the value.
   */
  getString() {
    const type = this.getType();
    switch (type) {
      case 'number':
      case 'boolean':
        return JSON.stringify(this.val);
      case 'string':
        return this.val;
      case 'nodeset':
        return this.val.length === 0 ? '' : this.val[0].getString();
      default:
        throw new Error(`Value.getString() not a suported type ${type}`);
    }
  }

  /**
   * Returns the XML "string value" of the data.
   * Primitive values are interpreted as XML text nodes.
   * Objects and arrays are mapped to elements.
   * "The string-value of an element node is the concatenation of the string-values of
   *  all text node descendants of the element node in document order."
   * @return a string representation of the value.
   */
  getStringValue() {
    const type = this.getType();
    switch (type) {
      case 'number':
      case 'boolean':
      case 'string': return this.getString();
      case 'nodeset': {
        return this.val.map((n) => n.getString()).join('');
      }
    }
  }

  getNodeSet() {
    const type = this.getType();
    switch (type) {
      case 'nodeset':
        return this.val;
      default:
        return [];
    }
  }

  getLocalName() {
    const type = this.getType();
    if (type === 'nodeset' && this.val.length !== 0) {
      return new Value(this.val[0].getLocalName());
    } else {
      return new Value('');
    }
  }

  getRoot() {
    const type = this.getType();
    if (type !== 'nodeset' || this.val.length === 0) {
      return new Value([]);
    } else {
      return new Value([this.val[0].getRoot()]);
    }
  }

  getNodeSetSize() {
    const type = this.getType();
    switch (type) {
      case 'number':
      case 'boolean':
      case 'string': return new Value(1);
      case 'nodeset': {
        return new Value(this.val.length);
      }
    }
  }

  nodeSetUnion(value) {
    if (!(this.getType() === 'nodeset' && value.getType() === 'nodeset')) {
      throw new Error('Value.nodeSetUnion both values must be nodesets');
    }
    const result = this.val.slice(); // make copy
    for (let i = 0; i < value.val.length; i++) {
      const node = value.val[i];
      if (!result.find((n) => n === node)) {
        result.push(node);
      }
    }
    return result;
  }
}

function consoleLogValue(value) {
  const type = value.getType();
  const val = value.getVal();
  switch (type) {
    case 'nodeset': {
      let s = '[';
      for (let i = 0; i < val.length; i++) {
        if (i > 0) {
          s += ', ';
        }
        s += `${JSON.stringify(val[i].getJson())}`;
      }
      s += ']';
      console.log(s);
      break;
    }
    default:
      console.log(`${val}`);
  }
}

exports.Value = Value;
exports.consoleLogValue = consoleLogValue;
