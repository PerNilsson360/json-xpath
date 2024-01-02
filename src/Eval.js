const Env = require('./Env').Env;
const ObjectNode = require('./Node').ObjectNode;
const Value = require('./Value').Value;
const parse = require('./xpath10').parse;

function evaluate(xpath, json) {
  const exp = parse(xpath);
  const context = JSON.parse(json);
  const env = new Env(new Value([new ObjectNode(null, '', context)]));
  return exp.eval(env, context);
}

exports.evaluate = evaluate;
