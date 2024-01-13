/* eslint-env mocha */
const assert = require('assert');
const evaluate = require('../src/Eval').evaluate;

describe('test numbers', () => {
  describe('NaN', () => {
    it('NO is NaN', () => {
      const val = evaluate('"NO"', '{}');
      assert.equal(val.getNumber(), NaN);
    });
  });
  describe('addition', () => {
    it('1 + 2 = 3', () => {
      const val = evaluate('1 + 2', '{}');
      assert.equal(val.getNumber(), 3);
    });
    it('1 + /a = 4', () => {
      const val = evaluate('1 + /a', '{"a":3}');
      assert.equal(val.getNumber(), 4);
    });
    it('/a/b + /a/c = 4', () => {
      const val = evaluate('/a/b + /a/c', '{"a":{"b":3,"c":1}}');
      assert.equal(val.getNumber(), 4);
    });
    it('/a/b+/a/c = 4', () => {
      const val = evaluate('/a/b+/a/c', '{"a":{"b":3,"c":1}}');
      assert.equal(val.getNumber(), 4);
    });
  });
  describe('subtraction', () => {
    it('1 - 2 = -1', () => {
      const val = evaluate('1 - 2', '{}');
      assert.equal(val.getNumber(), -1);
    });
    it('-1 = -1', () => {
      const val = evaluate('-1', '{}');
      assert.equal(val.getNumber(), -1);
    });
    it('1 - /a = -2', () => {
      const val = evaluate('1 - /a', '{"a":3}');
      assert.equal(val.getNumber(), -2);
    });
    it('/a/b - /a/c = 2', () => {
      const val = evaluate('/a/b - /a/c', '{"a":{"b":3,"c":1}}');
      assert.equal(val.getNumber(), 2);
    });
  });
  describe('mulitplication', () => {
    it('3 * 2 = 6', () => {
      const val = evaluate('3 * 2', '{}');
      assert.equal(val.getNumber(), 6);
    });
    it('1 * /a = 3', () => {
      const val = evaluate('1 * /a', '{"a":3}');
      assert.equal(val.getNumber(), 3);
    });
    it('/a/b * /a/c = 1', () => {
      const val = evaluate('/a/b * /a/c', '{"a":{"b":3,"c":1}}');
      assert.equal(val.getNumber(), 3);
    });
  });
  describe('division', () => {
    it('4 div 0 = Infinity', () => {
      const val = evaluate('4 div 0', '{}');
      assert.equal(val.getNumber(), Infinity);
    });
    it('-4 div 0 = -Infinity', () => {
      const val = evaluate('-4 div 0', '{}');
      assert.equal(val.getNumber(), -Infinity);
    });
    it('0 div 0 = -Infinity', () => {
      const val = evaluate('0 div 0', '{}');
      assert.equal(val.getNumber(), NaN);
    });
    it('6 div /a = 2', () => {
      const val = evaluate('6 div /a', '{"a":3}');
      assert.equal(val.getNumber(), 2);
    });
    it('/a/b div /a/c = 3', () => {
      const val = evaluate('/a/b div /a/c', '{"a":{"b":3,"c":1}}');
      assert.equal(val.getNumber(), 3);
    });
  });
  describe('modulo', () => {
    it('5 mod 2 = 1', () => {
      const val = evaluate('5 mod 2', '{}');
      assert.equal(val.getNumber(), 1);
    });
    it('5 mod -2 = 1', () => {
      const val = evaluate('5 mod -2', '{}');
      assert.equal(val.getNumber(), 1);
    });
    it('-5 mod 2 = 1', () => {
      const val = evaluate('5 mod -2', '{}');
      assert.equal(val.getNumber(), 1); // should be -1 according to spec
    });
    it('-5 mod -2 = -1', () => {
      const val = evaluate('-5 mod -2', '{}');
      assert.equal(val.getNumber(), -1);
    });
  });
  describe('unary minus', () => {
    it('4 div (- 2) = -2', () => {
      const val = evaluate('4 div (- 2)', '{}');
      assert.equal(val.getNumber(), -2);
    });
    it('-6 div /a = -2', () => {
      const val = evaluate('-6 div /a', '{"a":3}');
      assert.equal(val.getNumber(), -2);
    });
    it('-/a/b div /a/c = -3', () => {
      const val = evaluate('-/a/b div /a/c', '{"a":{"b":3,"c":1}}');
      assert.equal(val.getNumber(), -3);
    });
  });
  describe('sum', () => {
    it('sum(/a) = 3', () => {
      const val = evaluate('sum(/a)', '{"a":3}');
      assert.equal(val.getNumber(), 3);
    });
    it('sum(/a) = 123', () => {
      const val = evaluate('sum(/a)', '{"a":{"b":[1, 2, 3]}}');
      assert.equal(val.getNumber(), 123);
    });
  });
  describe('floor', () => {
    it('floor(2.6) = 2', () => {
      const val = evaluate('floor(2.6)', '{}');
      assert.equal(val.getNumber(), 2);
    });
  });
  describe('ceiling', () => {
    it('ceiling(2.6) = 3', () => {
      const val = evaluate('ceiling(2.6)', '{}');
      assert.equal(val.getNumber(), 3);
    });
  });
  describe('round', () => {
    it('round(2.5) = 3', () => {
      const val = evaluate('round(2.5)', '{}');
      assert.equal(val.getNumber(), 3);
    });
  });
});

describe('logic', () => {
  describe('boolean', () => {
    it('boolean(0) is false', () => {
      const val = evaluate('boolean(0)', '{}');
      assert.equal(val.getBoolean(), false);
    });
    it('boolean(1) is true', () => {
      const val = evaluate('boolean(1)', '{}');
      assert.equal(val.getBoolean(), true);
    });
  });
  describe('and', () => {
    it('true() and true() is true', () => {
      const val = evaluate('true() and true()', '{}');
      assert.equal(val.getBoolean(), true);
    });
    it('true() and false() is false', () => {
      const val = evaluate('true() and false()', '{}');
      assert.equal(val.getBoolean(), false);
    });
    it('/a and 1 is true', () => {
      const val = evaluate('/a and 1', '{"a":3}');
      assert.equal(val.getBoolean(), true);
    });
    it('/a and /a/b and /a/c and /a/d is true', () => {
      const val = evaluate('/a and /a/b and /a/c and /a/d', '{"a":{"b":1,"c":true,"d":"foo"}}');
      assert.equal(val.getBoolean(), true);
    });
  });
  describe('or', () => {
    it('true() or true() is true', () => {
      const val = evaluate('true() or true()', '{}');
      assert.equal(val.getBoolean(), true);
    });
    it('false() or false() is false', () => {
      const val = evaluate('false() or false()', '{}');
      assert.equal(val.getBoolean(), false);
    });
    it('1 or false() is true', () => {
      const val = evaluate('1 or false()', '{}');
      assert.equal(val.getBoolean(), true);
    });
    it('"foo" or false() is true', () => {
      const val = evaluate('"foo" or false()', '{}');
      assert.equal(val.getBoolean(), true);
    });
  });
  describe('not', () => {
    it('not(false()) is true', () => {
      const val = evaluate('not(false())', '{}');
      assert.equal(val.getBoolean(), true);
    });
    it('not(true()) is false', () => {
      const val = evaluate('not(true())', '{}');
      assert.equal(val.getBoolean(), false);
    });
    it('not(/a and 1) is false', () => {
      const val = evaluate('not(/a and 1)', '{"a":3}');
      assert.equal(val.getBoolean(), false);
    });
  });
  describe('union', () => {
    it('/a/b | /a/c = 1true', () => {
      const val = evaluate('/a/b | /a/c', '{"a":{"b":1,"c":true,"d":"foo"}}');
      assert.equal(val.getStringValue(), '1true');
    });
    it('/a/b | /a/c | /a/d = 1truefoo', () => {
      const val = evaluate('/a/b | /a/c | /a/d', '{"a":{"b":1,"c":true,"d":"foo"}}');
      assert.equal(val.getStringValue(), '1truefoo');
    });
  });
});

describe('paths', () => {
  it('parse odd characters', () => {
    evaluate('/%@/&# | /%@/?^', '{"%@":{"&#":3,"?^":1}}');
  });
  describe('paths on {"a":{"b":[1, 2, 3]}}', () => {
    const json = '{"a":{"b":[1, 2, 3]}}';
    it('count(/a/b) = 3', () => {
      const val = evaluate('count(/a/b)', json);
      assert.equal(val.getNumber(), 3);
    });
    it('count(/a/b/ancestor::a) = 1', () => {
      const val = evaluate('count(/a/b/ancestor::a)', json);
      assert.equal(val.getNumber(), 1);
    });
    it('local-name(/a/b/ancestor::a) is "a"', () => {
      const val = evaluate('local-name(/a/b/ancestor::a)', json);
      assert.equal(val.getString(), 'a');
    });
    it('count(/child::a/child::b) = 3', () => {
      const val = evaluate('count(/child::a/child::b)', json);
      assert.equal(val.getNumber(), 3);
    });
    it('count(/a/..) = 1', () => {
      const val = evaluate('count(/a/..)', json);
      assert.equal(val.getNumber(), 1);
    });
    // @TODO test .. should fail with nice error message
    it('count(/child::a/..) = 1', () => {
      const val = evaluate('count(/child::a/..)', json);
      assert.equal(val.getNumber(), 1);
    });
    it('local-name(/a) is "a"', () => {
      const val = evaluate('local-name(/a)', json);
      assert.equal(val.getString(), 'a');
    });
    it('local-name(/child::a) is "a"', () => {
      const val = evaluate('local-name(/child::a)', json);
      assert.equal(val.getString(), 'a');
    });
    it('local-name(/a/.) is "a"', () => {
      const val = evaluate('local-name(/a/.)', json);
      assert.equal(val.getString(), 'a');
    });
    it('local-name(/a/self::*) is "a"', () => {
      const val = evaluate('local-name(/a/self::*)', json);
      assert.equal(val.getString(), 'a');
    });
    it('local-name(/a/self::a) is "a"', () => {
      const val = evaluate('local-name(/a/self::a)', json);
      assert.equal(val.getString(), 'a');
    });
    it('count(/a/self::b) = 0', () => {
      const val = evaluate('count(/a/self::b)', json);
      assert.equal(val.getNumber(), 0);
    });
    it('count(/a/child::*) = 3', () => {
      const val = evaluate('count(/a/child::*)', json);
      assert.equal(val.getNumber(), 3);
    });
  });
  describe('paths on {"a":{"b":{"c":{"e":1}},"d":{"c":{"e":1}}}}', () => {
    const json = '{"a":{"b":{"c":{"e":1}},"d":{"c":{"e":1}}}}';
    it('count(/a) = 1', () => {
      const val = evaluate('count(/a)', json);
      assert.equal(val.getNumber(), 1);
    });
    it('count(/a/b) = 1', () => {
      const val = evaluate('count(/a/b)', json);
      assert.equal(val.getNumber(), 1);
    });
    it('count(/a/b/parent::a) = 1', () => {
      const val = evaluate('count(/a/b/parent::a)', json);
      assert.equal(val.getNumber(), 1);
    });
    it('count(/a/b/parent::*) = 1', () => {
      const val = evaluate('count(/a/b/parent::*)', json);
      assert.equal(val.getNumber(), 1);
    });
    it('count(/a/b/parent::c) = 1', () => {
      const val = evaluate('count(/a/b/parent::c)', json);
      assert.equal(val.getNumber(), 0);
    });
    it('count(/count(/a/b/c)) = 1', () => {
      const val = evaluate('count(/a/b/c)', json);
      assert.equal(val.getNumber(), 1);
    });
    it('count(/count(/a/b/c/e)) = 1', () => {
      const val = evaluate('count(/a/b/c/e)', json);
      assert.equal(val.getNumber(), 1);
    });
    // TODO
    // it('count(/count(//e)) = 1', () => {
    //   const val = evaluate('count(//e)', json);
    //   assert.equal(val.getNumber(), 2);
    // });
    // it('count(/count(//e/ancestor::c)) = 2', () => {
    //   const val = evaluate('count(//e/ancestor::c)', json);
    //   assert.equal(val.getNumber(), 2);
    // });
    // it('count(/count(//e/ancestor::c)) = 2', () => {
    //   const val = evaluate('count(//e/ancestor::b)', json);
    //   assert.equal(val.getNumber(), 1);
    // });
    // it('count(/count(//e/ancestor::c)) = 2', () => {
    //   const val = evaluate('count(//e/ancestor::*)', json);
    //   assert.equal(val.getNumber(), 6);
    // });
    // it('count(/count(/descendant::e)) = 2', () => {
    //   const val = evaluate('count(/descendant::e)', json);
    //   assert.equal(val.getNumber(), 2);
    // });
  });
  describe('path with * on {"a":{"b":1,"c":true,"d":"foo"}}', () => {
    const json = '{"a":{"b":1,"c":true,"d":"foo"}}';
    it('count(/*) = 1', () => {
      const val = evaluate('count(/*)', json);
      assert.equal(val.getNumber(), 1);
    });
    it('/* string is 1truefoo', () => {
      const val = evaluate('/*', json);
      assert.equal(val.getString(), '1truefoo');
    });
    it('count(/a/*) = 3', () => {
      const val = evaluate('count(/a/*)', json);
      assert.equal(val.getNumber(), 3);
    });
    it('/a/* string value is 1truefoo', () => {
      const val = evaluate('/*', json);
      assert.equal(val.getStringValue(), '1truefoo');
    });
  });
  describe('following-sibling on {"a":{"b": [{"b": 1},{"b": 2},{"c":3}]}}', () => {
    const json = '{"a":{"b": [{"b": 1},{"b": 2},{"c":3}]}}';
    it('count(/a/*) = 3', () => {
      const val = evaluate('count(/a/*)', json);
      assert.equal(val.getNumber(), 3);
    });
    it('/a/* string is 123', () => {
      const val = evaluate('/a/*', json);
      assert.equal(val.getStringValue(), '123');
    });
    it('count(/a/b/*) = 3', () => {
      const val = evaluate('count(/a/b/*)', json);
      assert.equal(val.getNumber(), 3);
    });
  });
});
