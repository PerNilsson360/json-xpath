// MIT license
//
// Copyright 2023 Per Nilsson
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
    it('count(/a/b/c) = 1', () => {
      const val = evaluate('count(/a/b/c)', json);
      assert.equal(val.getNumber(), 1);
    });
    it('count(/a/b/c/e) = 1', () => {
      const val = evaluate('count(/a/b/c/e)', json);
      assert.equal(val.getNumber(), 1);
    });
    it('count(//e) = 1', () => {
      const val = evaluate('count(//e)', json);
      assert.equal(val.getNumber(), 2);
    });
    it('count(/count(//e/ancestor::c)) = 2', () => {
      const val = evaluate('count(//e/ancestor::c)', json);
      assert.equal(val.getNumber(), 2);
    });
    it('count(/count(//e/ancestor::b)) = 2', () => {
      const val = evaluate('count(//e/ancestor::b)', json);
      assert.equal(val.getNumber(), 1);
    });
    it('count(/count(//e/ancestor::*)) = 2', () => {
      const val = evaluate('count(//e/ancestor::*)', json);
      assert.equal(val.getNumber(), 6);
    });
    it('count(/count(/descendant::e)) = 2', () => {
      const val = evaluate('count(/descendant::e)', json);
      assert.equal(val.getNumber(), 2);
    });
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
    // TODO
    // r = (eval("count(/a/b/following-sibling::*)", document));
    // assert(r.getNumber() == 2);
    // r = eval("/a/b/following-sibling::*", document);
    // assert(r.getStringValue() == "23");
    // r = eval("/a/b/following-sibling::*[2]", document);
    // assert(r.getStringValue() == "3");
    // r = eval("count(/a/b[b = 2]/following-sibling::*)", document);
    // assert(r.getNumber() == 1);
    // r = eval("/a/b[b = 2]/following-sibling::*", document);
    // assert(r.getStringValue() == "3");
    // r = (eval("count(/a/b/following-sibling::b)", document));
    // assert(r.getNumber() == 2);
    // r = (eval("/a/b/following-sibling::b", document));
    // assert(r.getStringValue() == "23");
    // r = eval("/a/b/following-sibling::b[1]", document);
    // assert(r.getStringValue() == "2");
    // r = eval("count(/a/b[b = 2]/following-sibling::b)", document);
    // assert(r.getNumber() == 1);
    // r = eval("/a/b[b = 2]/following-sibling::b", document);
    // assert(r.getStringValue() == "3");
  });
  describe('Descendant on {"a":3}', () => {
    const json = '{"a":3}';
    it('count(//a) = 1', () => {
      const val = evaluate('count(//a)', json);
      assert.equal(val.getNumber(), 1);
    });
    it('count(//*) = 1', () => {
      const val = evaluate('count(//*)', json);
      assert.equal(val.getNumber(), 1);
    });
    it('count(/descendant::*) = 1', () => {
      const val = evaluate('count(/descendant::*)', json);
      assert.equal(val.getNumber(), 1);
    });
    it('count(//.) = 1', () => {
      const val = evaluate('count(//.)', json);
      assert.equal(val.getNumber(), 1);
    });
  });
  describe('descendant on {"a":{"b":3,"c":1}}', () => {
    const json = '{"a":{"b":3,"c":1}}';
    it('count(//a) = 1', () => {
      const val = evaluate('count(//a)', json);
      assert.equal(val.getNumber(), 1);
    });
    it('count(/descendant::a) = 1', () => {
      const val = evaluate('count(/descendant::a)', json);
      assert.equal(val.getNumber(), 1);
    });
    it('count(//*) = 3', () => {
      const val = evaluate('count(//*)', json);
      assert.equal(val.getNumber(), 3);
    });
    it('count(/descendant::*) = 3', () => {
      const val = evaluate('count(/descendant::*)', json);
      assert.equal(val.getNumber(), 3);
    });
    it('count(//b) = 1', () => {
      const val = evaluate('count(//b)', json);
      assert.equal(val.getNumber(), 1);
    });
    it('local-name(//b/..) is "a"', () => {
      const val = evaluate('local-name(//b/..)', json);
      assert.equal(val.getString(), 'a');
    });
  });
  describe('descendant on {"a":{"b":{"c":{"e":1}},"d":{"c":{"e":1}}}}', () => {
    const json = '{"a":{"b":{"c":{"e":1}},"d":{"c":{"e":1}}}}';
    it('count(//a) = 1', () => {
      const val = evaluate('count(//a)', json);
      assert.equal(val.getNumber(), 1);
    });
    it('count(//b) = 1', () => {
      const val = evaluate('count(//b)', json);
      assert.equal(val.getNumber(), 1);
    });
    it('count(/descendant::b) = 1', () => {
      const val = evaluate('count(/descendant::b)', json);
      assert.equal(val.getNumber(), 1);
    });
    it('count(/descendant::b/c) = 1', () => {
      const val = evaluate('count(/descendant::b/c)', json);
      assert.equal(val.getNumber(), 1);
    });
    it('count(//c) = 2', () => {
      const val = evaluate('count(//c)', json);
      assert.equal(val.getNumber(), 2);
    });
    it('count(/descendant::c) = 2', () => {
      const val = evaluate('count(//c)', json);
      assert.equal(val.getNumber(), 2);
    });
    it('count(//c/e) = 2', () => {
      const val = evaluate('count(//c/e)', json);
      assert.equal(val.getNumber(), 2);
    });
    it('count(/descendant::c/e) = 2', () => {
      const val = evaluate('count(/descendant::c/e)', json);
      assert.equal(val.getNumber(), 2);
    });
    it('count(/descendant::e) = 2', () => {
      const val = evaluate('count(/descendant::e)', json);
      assert.equal(val.getNumber(), 2);
    });
    it('count(/a//e) = 2', () => {
      const val = evaluate('count(/descendant::e)', json);
      assert.equal(val.getNumber(), 2);
    });
    it('count(/a/descendant::e) = 2', () => {
      const val = evaluate('count(/descendant::e)', json);
      assert.equal(val.getNumber(), 2);
    });
    it('count(//e/..) = 2', () => {
      const val = evaluate('count(//e/..)', json);
      assert.equal(val.getNumber(), 2);
    });
    it('count(//descendant::e/..) = 2', () => {
      const val = evaluate('count(//e/..)', json);
      assert.equal(val.getNumber(), 2);
    });
    it('count(//e/../../..) = 1', () => {
      const val = evaluate('count(//e/../../..)', json);
      assert.equal(val.getNumber(), 1);
    });
    it('count(//descendant::e/../../..) = 1', () => {
      const val = evaluate('count(//e/../../..)', json);
      assert.equal(val.getNumber(), 1);
    });
  });
  describe('descendant on {"a":{"b":[1,2,3,4]}}', () => {
    const json = '{"a":{"b":[1,2,3,4]}}';
    it('count(//b) = 4', () => {
      const val = evaluate('count(//b)', json);
      assert.equal(val.getNumber(), 4);
    });
    it('count(/descendant::b) = 4', () => {
      const val = evaluate('count(/descendant::b)', json);
      assert.equal(val.getNumber(), 4);
    });
    it('count(//*) = 5', () => {
      const val = evaluate('count(//*)', json);
      assert.equal(val.getNumber(), 5);
    });
    it('count(/descendant::*) = 5', () => {
      const val = evaluate('count(/descendant::*)', json);
      assert.equal(val.getNumber(), 5);
    });
    it('count(//.) = 5', () => {
      const val = evaluate('count(//.)', json);
      assert.equal(val.getNumber(), 5);
    });
  });
  describe('paths on {"a":{"a":{"a":1}}}', () => {
    const json = '{"a":{"a":{"a":1}}}';
    it('count(//a) = 3', () => {
      const val = evaluate('count(//a)', json);
      assert.equal(val.getNumber(), 3);
    });
    it('count(/descendant::a) = 3', () => {
      const val = evaluate('count(/descendant::a)', json);
      assert.equal(val.getNumber(), 3);
    });
    it('count(/descendant-or-self::a) = 3', () => {
      const val = evaluate('count(/descendant-or-self::a)', json);
      assert.equal(val.getNumber(), 3);
    });
    it('count(/a/descendant-or-self::a) = 3', () => {
      const val = evaluate('count(/a/descendant-or-self::a)', json);
      assert.equal(val.getNumber(), 3);
    });
    it('count(/descendant-or-self::*) = 3', () => {
      const val = evaluate('count(/a/descendant-or-self::*)', json);
      assert.equal(val.getNumber(), 3);
    });
    it('count(/a/descendant-or-self::*) = 3', () => {
      const val = evaluate('count(/a/descendant-or-self::*)', json);
      assert.equal(val.getNumber(), 3);
    });
    it('count(//a/a) = 2', () => {
      const val = evaluate('count(//a/a)', json);
      assert.equal(val.getNumber(), 2);
    });
    it('count(/descendant::a/a) = 2', () => {
      const val = evaluate('count(/descendant::a/a)', json);
      assert.equal(val.getNumber(), 2);
    });
    it('count(//.) = 3', () => {
      const val = evaluate('count(//.)', json);
      assert.equal(val.getNumber(), 3);
    });
    it('count(/a/a/a/ancestor-or-self::a) = 3', () => {
      const val = evaluate('count(/a/a/a/ancestor-or-self::a)', json);
      assert.equal(val.getNumber(), 3);
    });
  });
  describe('paths on {"a":[{"a":1},{"a":2},{"b":3}]}', () => {
    const json = '{"a":[{"a":1},{"a":2},{"b":3}]}';
    it('count(//a) = 5', () => {
      const val = evaluate('count(//a)', json);
      assert.equal(val.getNumber(), 5);
    });
    it('count(/descendant::a) = 5', () => {
      const val = evaluate('count(/descendant::a)', json);
      assert.equal(val.getNumber(), 5);
    });
    it('count(/a/descendant-or-self::a) = 5', () => {
      const val = evaluate('count(/a/descendant-or-self::a)', json);
      assert.equal(val.getNumber(), 5);
    });
    it('count(//*) = 6', () => {
      const val = evaluate('count(//*)', json);
      assert.equal(val.getNumber(), 6);
    });
    it('count(//.) = 6', () => {
      const val = evaluate('count(//.)', json);
      assert.equal(val.getNumber(), 6);
    });
    it('//a is 12312', () => {
      const val = evaluate('//a', json);
      assert.equal(val.getStringValue(), '12312');
    });
    it('/descendant::a is 12312', () => {
      const val = evaluate('/descendant::a', json);
      assert.equal(val.getStringValue(), '12312');
    });
    it('count(/a/a/ancestor-or-self::a) = 4', () => {
      const val = evaluate('count(/a/a/ancestor-or-self::a)', json);
      assert.equal(val.getNumber(), 4);
    });
  });
});

describe('test relations', () => {
  describe('= on atomic types', () => {
    const json = '{}';
    it('1 = 1', () => {
      const val = evaluate('1 = 1', json);
      assert.equal(val.getBoolean(), true);
    });
    it('1 = 2', () => {
      const val = evaluate('1 = 2', json);
      assert.equal(val.getBoolean(), false);
    });
    it('true() = true()', () => {
      const val = evaluate('true() = true()', json);
      assert.equal(val.getBoolean(), true);
    });
    it('false() = false()', () => {
      const val = evaluate('false() = false()', json);
      assert.equal(val.getBoolean(), true);
    });
    it('false() = true()', () => {
      const val = evaluate('false() = true()', json);
      assert.equal(val.getBoolean(), false);
    });
    it('"a" = "a"', () => {
      const val = evaluate('"a" = "a"', json);
      assert.equal(val.getBoolean(), true);
    });
    it('"a" = "b"', () => {
      const val = evaluate('"a" = "b"', json);
      assert.equal(val.getBoolean(), false);
    });
    it('\'a\' = \'b\'', () => {
      const val = evaluate('\'a\' = \'b\'', json);
      assert.equal(val.getBoolean(), false);
    });
  });
  describe('= on {"a":{"b":{"c":{"e":1}},"d":{"c":{"e":1}}}}', () => {
    const json = '{"a":{"b":{"c":{"e":1}},"d":{"c":{"e":1}}}}';
    it('/a/b/c/e = 1', () => {
      const val = evaluate('/a/b/c/e = 1', json);
      assert.equal(val.getBoolean(), true);
    });
    it('/a/b/c/e = \'1\'', () => {
      const val = evaluate('/a/b/c/e = \'1\'', json);
      assert.equal(val.getBoolean(), true);
    });
    it('/a/b/c/e = \'2\'', () => {
      const val = evaluate('/a/b/c/e = \'2\'', json);
      assert.equal(val.getBoolean(), false);
    });
    it('/a/b/c/e = true()', () => {
      const val = evaluate('/a/b/c/e = true()', json);
      assert.equal(val.getBoolean(), true);
    });
    it('/a/b/c/e = false()', () => {
      const val = evaluate('/a/b/c/e = false()', json);
      assert.equal(val.getBoolean(), false);
    });
    it('/a/b/c = /a/d/c', () => {
      const val = evaluate('/a/b/c = /a/d/c', json);
      assert.equal(val.getBoolean(), true);
    });
    it('/a/b/c = /a/d', () => {
      const val = evaluate('/a/b/c = /a/d', json);
      assert.equal(val.getBoolean(), true);
    });
    it('/a/b/c=/a/d', () => {
      const val = evaluate('/a/b/c=/a/d', json);
      assert.equal(val.getBoolean(), true);
    });
  });
  describe('!= on atomic types', () => {
    const json = '{}';
    it('1 != 1', () => {
      const val = evaluate('1 != 1', json);
      assert.equal(val.getBoolean(), false);
    });
    it('1 != 2', () => {
      const val = evaluate('1 != 2', json);
      assert.equal(val.getBoolean(), true);
    });
    it('true() != true()', () => {
      const val = evaluate('true() != true()', json);
      assert.equal(val.getBoolean(), false);
    });
    it('false() != false()', () => {
      const val = evaluate('false() != false()', json);
      assert.equal(val.getBoolean(), false);
    });
    it('false() != true()', () => {
      const val = evaluate('false() != true()', json);
      assert.equal(val.getBoolean(), true);
    });
    it('"a" != "a"', () => {
      const val = evaluate('"a" != "a"', json);
      assert.equal(val.getBoolean(), false);
    });
    it('"a" != "b"', () => {
      const val = evaluate('"a" != "b"', json);
      assert.equal(val.getBoolean(), true);
    });
    it('\'a\' != \'b\'', () => {
      const val = evaluate('\'a\' != \'b\'', json);
      assert.equal(val.getBoolean(), true);
    });
  });
  describe('!= on {"a":{"b":{"c":{"e":1}},"d":{"c":{"e":1}}}}', () => {
    const json = '{"a":{"b":{"c":{"e":1}},"d":{"c":{"e":1}}}}';
    it('/a/b/c/e != 1', () => {
      const val = evaluate('/a/b/c/e != 1', json);
      assert.equal(val.getBoolean(), false);
    });
    it('/a/b/c/e != \'1\'', () => {
      const val = evaluate('/a/b/c/e != \'1\'', json);
      assert.equal(val.getBoolean(), false);
    });
    it('/a/b/c/e != \'2\'', () => {
      const val = evaluate('/a/b/c/e != \'2\'', json);
      assert.equal(val.getBoolean(), true);
    });
    it('/a/b/c/e != true()', () => {
      const val = evaluate('/a/b/c/e != true()', json);
      assert.equal(val.getBoolean(), false);
    });
    it('/a/b/c/e != false()', () => {
      const val = evaluate('/a/b/c/e != false()', json);
      assert.equal(val.getBoolean(), true);
    });
    it('/a/b/c != /a/d/c', () => {
      const val = evaluate('/a/b/c != /a/d/c', json);
      assert.equal(val.getBoolean(), false);
    });
    it('/a/b/c != /a/d', () => {
      const val = evaluate('/a/b/c != /a/d', json);
      assert.equal(val.getBoolean(), false);
    });
    it('/a/b/c!=/a/d', () => {
      const val = evaluate('/a/b/c!=/a/d', json);
      assert.equal(val.getBoolean(), false);
    });
  });
  describe('< on atomic types', () => {
    const json = '{}';
    it('1 < 1', () => {
      const val = evaluate('1 < 1', json);
      assert.equal(val.getBoolean(), false);
    });
    it('1 < 2', () => {
      const val = evaluate('1 < 2', json);
      assert.equal(val.getBoolean(), true);
    });
    it('true() < true()', () => {
      const val = evaluate('true() < true()', json);
      assert.equal(val.getBoolean(), false);
    });
    it('false() < false()', () => {
      const val = evaluate('false() < false()', json);
      assert.equal(val.getBoolean(), false);
    });
    it('false() < true()', () => {
      const val = evaluate('false() < true()', json);
      assert.equal(val.getBoolean(), true);
    });
    it('"a" <= "a"', () => {
      const val = evaluate('"a" <= "a"', json);
      assert.equal(val.getBoolean(), false);
    });
  });
  describe('< on {"a":{"b":{"c":{"e":1}},"d":{"c":{"e":1}}}}', () => {
    const json = '{"a":{"b":{"c":{"e":1}},"d":{"c":{"e":1}}}}';
    it('/a/b/c/e < 2', () => {
      const val = evaluate('/a/b/c/e < 2', json);
      assert.equal(val.getBoolean(), true);
    });
    it('/a/b/c/e < \'1\'', () => {
      const val = evaluate('/a/b/c/e < \'1\'', json);
      assert.equal(val.getBoolean(), false);
    });
    it('/a/b/c/e < \'2\'', () => {
      const val = evaluate('/a/b/c/e < \'2\'', json);
      assert.equal(val.getBoolean(), true);
    });
    it('/a/b/c/e < true()', () => {
      const val = evaluate('/a/b/c/e < true()', json);
      assert.equal(val.getBoolean(), false);
    });
    it('/a/b/c/e < false()', () => {
      const val = evaluate('/a/b/c/e < false()', json);
      assert.equal(val.getBoolean(), false);
    });
    it('/a/b/c < /a/d/e', () => {
      const val = evaluate('/a/b/c < /a/d/e', json);
      assert.equal(val.getBoolean(), false);
    });
    it('/a/b/c < /a/d', () => {
      const val = evaluate('/a/b/c < /a/d', json);
      assert.equal(val.getBoolean(), false);
    });
    it('/a/b/c</a/d', () => {
      const val = evaluate('/a/b/c</a/d', json);
      assert.equal(val.getBoolean(), false);
    });
  });
  describe('<= on atomic types', () => {
    const json = '{}';
    it('1 <= 1', () => {
      const val = evaluate('1 <= 1', json);
      assert.equal(val.getBoolean(), true);
    });
    it('1 <= 2', () => {
      const val = evaluate('1 <= 2', json);
      assert.equal(val.getBoolean(), true);
    });
    it('true() <= true()', () => {
      const val = evaluate('true() <= true()', json);
      assert.equal(val.getBoolean(), true);
    });
    it('false() <= false()', () => {
      const val = evaluate('false() <= false()', json);
      assert.equal(val.getBoolean(), true);
    });
    it('false() <= true()', () => {
      const val = evaluate('false() <= true()', json);
      assert.equal(val.getBoolean(), true);
    });
    it('"a" <= "a"', () => {
      const val = evaluate('"a" != "a"', json);
      assert.equal(val.getBoolean(), false);
    });
  });
  describe('<= on {"a":{"b":{"c":{"e":1}},"d":{"c":{"e":1}}}}', () => {
    const json = '{"a":{"b":{"c":{"e":1}},"d":{"c":{"e":1}}}}';
    it('/a/b/c/e <= 2', () => {
      const val = evaluate('/a/b/c/e <= 2', json);
      assert.equal(val.getBoolean(), true);
    });
    it('/a/b/c/e <= \'1\'', () => {
      const val = evaluate('/a/b/c/e <= \'1\'', json);
      assert.equal(val.getBoolean(), true);
    });
    it('/a/b/c/e <= \'2\'', () => {
      const val = evaluate('/a/b/c/e <= \'2\'', json);
      assert.equal(val.getBoolean(), true);
    });
    it('/a/b/c/e <= true()', () => {
      const val = evaluate('/a/b/c/e <= true()', json);
      assert.equal(val.getBoolean(), true);
    });
    it('/a/b/c/e <= false()', () => {
      const val = evaluate('/a/b/c/e <= false()', json);
      assert.equal(val.getBoolean(), false);
    });
    it('/a/b/c <= /a/d/c', () => {
      const val = evaluate('/a/b/c <= /a/d/c', json);
      assert.equal(val.getBoolean(), true);
    });
    it('/a/b/c <= /a/d', () => {
      const val = evaluate('/a/b/c <= /a/d', json);
      assert.equal(val.getBoolean(), true);
    });
    it('/a/b/c<=/a/d', () => {
      const val = evaluate('/a/b/c<=/a/d', json);
      assert.equal(val.getBoolean(), true);
    });
  });
  describe('> on atomic types', () => {
    const json = '{}';
    it('1 > 1', () => {
      const val = evaluate('1 > 1', json);
      assert.equal(val.getBoolean(), false);
    });
    it('1 > 2', () => {
      const val = evaluate('1 > 2', json);
      assert.equal(val.getBoolean(), false);
    });
    it('true() > true()', () => {
      const val = evaluate('true() > true()', json);
      assert.equal(val.getBoolean(), false);
    });
    it('false() > false()', () => {
      const val = evaluate('false() > false()', json);
      assert.equal(val.getBoolean(), false);
    });
    it('true() > false()', () => {
      const val = evaluate('true() > false()', json);
      assert.equal(val.getBoolean(), true);
    });
    it('"a" > "a"', () => {
      const val = evaluate('"a" > "a"', json);
      assert.equal(val.getBoolean(), false);
    });
  });
  describe('> on {"a":{"b":{"c":{"e":1}},"d":{"c":{"e":1}}}}', () => {
    const json = '{"a":{"b":{"c":{"e":1}},"d":{"c":{"e":1}}}}';
    it('/a/b/c/e > 2', () => {
      const val = evaluate('/a/b/c/e > 2', json);
      assert.equal(val.getBoolean(), false);
    });
    it('/a/b/c/e > \'1\'', () => {
      const val = evaluate('/a/b/c/e > \'1\'', json);
      assert.equal(val.getBoolean(), false);
    });
    it('/a/b/c/e > \'2\'', () => {
      const val = evaluate('/a/b/c/e > \'2\'', json);
      assert.equal(val.getBoolean(), false);
    });
    it('/a/b/c/e > true()', () => {
      const val = evaluate('/a/b/c/e > true()', json);
      assert.equal(val.getBoolean(), false);
    });
    it('/a/b/c/e > false()', () => {
      const val = evaluate('/a/b/c/e > false()', json);
      assert.equal(val.getBoolean(), true);
    });
    it('/a/b/c > /a/d/c', () => {
      const val = evaluate('/a/b/c > /a/d/c', json);
      assert.equal(val.getBoolean(), false);
    });
    it('/a/b/c > /a/d', () => {
      const val = evaluate('/a/b/c > /a/d', json);
      assert.equal(val.getBoolean(), false);
    });
    it('/a/b/c>/a/d', () => {
      const val = evaluate('/a/b/c>/a/d', json);
      assert.equal(val.getBoolean(), false);
    });
  });
  describe('>= on atomic types', () => {
    const json = '{}';
    it('1 >= 1', () => {
      const val = evaluate('1 >= 1', json);
      assert.equal(val.getBoolean(), true);
    });
    it('1 >= 2', () => {
      const val = evaluate('1 >= 2', json);
      assert.equal(val.getBoolean(), false);
    });
    it('true() >= true()', () => {
      const val = evaluate('true() >= true()', json);
      assert.equal(val.getBoolean(), true);
    });
    it('false() >= false()', () => {
      const val = evaluate('false() >= false()', json);
      assert.equal(val.getBoolean(), true);
    });
    it('true() >= false()', () => {
      const val = evaluate('true() >= false()', json);
      assert.equal(val.getBoolean(), true);
    });
    it('"a" >= "a"', () => {
      const val = evaluate('"a" >= "a"', json);
      assert.equal(val.getBoolean(), false);
    });
  });
  describe('>= on {"a":{"b":{"c":{"e":1}},"d":{"c":{"e":1}}}}', () => {
    const json = '{"a":{"b":{"c":{"e":1}},"d":{"c":{"e":1}}}}';
    it('/a/b/c/e >= 2', () => {
      const val = evaluate('/a/b/c/e >= 2', json);
      assert.equal(val.getBoolean(), false);
    });
    it('/a/b/c/e >= \'1\'', () => {
      const val = evaluate('/a/b/c/e >= \'1\'', json);
      assert.equal(val.getBoolean(), true);
    });
    it('/a/b/c/e >= \'2\'', () => {
      const val = evaluate('/a/b/c/e >= \'2\'', json);
      assert.equal(val.getBoolean(), false);
    });
    it('/a/b/c/e >= true()', () => {
      const val = evaluate('/a/b/c/e >= true()', json);
      assert.equal(val.getBoolean(), true);
    });
    it('/a/b/c/e >= false()', () => {
      const val = evaluate('/a/b/c/e >= false()', json);
      assert.equal(val.getBoolean(), true);
    });
    it('/a/b/c >= /a/d/c', () => {
      const val = evaluate('/a/b/c >= /a/d/c', json);
      assert.equal(val.getBoolean(), true);
    });
    it('/a/b/c >= /a/d', () => {
      const val = evaluate('/a/b/c >= /a/d', json);
      assert.equal(val.getBoolean(), true);
    });
    it('/a/b/c>=/a/d', () => {
      const val = evaluate('/a/b/c>=/a/d', json);
      assert.equal(val.getBoolean(), true);
    });
  });
});

describe('filters/predicates', () => {
  describe('filters on {"a":{"b":[1,2,3,4]}}', () => {
    const json = '{"a":{"b":[1,2,3,4]}}';
    it('count(/a/b[. = 1])', () => {
      const val = evaluate('count(/a/b[. = 1])', json);
      assert.equal(val.getNumber(), 1);
    });
    it('count(/a/b[number(.) = 1])', () => {
      const val = evaluate('count(/a/b[number(.) = 1])', json);
      assert.equal(val.getNumber(), 1);
    });
    it('count(/a/b[string() = \'1\'])', () => {
      const val = evaluate('count(/a/b[string() = \'1\'])', json);
      assert.equal(val.getNumber(), 1);
    });
    it('count(/a/b[boolean()])', () => {
      const val = evaluate('count(/a/b[boolean()])', json);
      assert.equal(val.getNumber(), 4);
    });
    it('count(/a/b[not(. = 1)])', () => {
      const val = evaluate('count(/a/b[not(. = 1)])', json);
      assert.equal(val.getNumber(), 3);
    });
    it('count(/a/b[not(. = 1)][not(. = 2)])', () => {
      const val = evaluate('count(/a/b[not(. = 1)][not(. = 2)])', json);
      assert.equal(val.getNumber(), 2);
    });
    it('count(/a/b[not(. = 1)][not(. = 2)][not(. = 3)])', () => {
      const val = evaluate('count(/a/b[not(. = 1)][not(. = 2)][not(. = 3)])', json);
      assert.equal(val.getNumber(), 1);
    });
    it('count(/a/b[not(. = 1)][not(. = 2)][not(. = 3)][not(. = 4)])', () => {
      const val = evaluate('count(/a/b[not(. = 1)][not(. = 2)][not(. = 3)][not(. = 4)])', json);
      assert.equal(val.getNumber(), 0);
    });
    it('count(/a/b[count(//b) = 4])', () => {
      const val = evaluate('count(/a/b[count(//b) = 4])', json);
      assert.equal(val.getNumber(), 4);
    });
    it('count(/a/b[1])', () => {
      const val = evaluate('/a/b[1]', json);
      assert.equal(val.getNumber(), 1);
    });
    it('count(/a/b[2])', () => {
      const val = evaluate('/a/b[2]', json);
      assert.equal(val.getNumber(), 2);
    });
    it('count(/a/b[2 +1])', () => {
      const val = evaluate('/a/b[2 +1]', json);
      assert.equal(val.getNumber(), 3);
    });
    it('count(/a/b[0])', () => {
      const val = evaluate('count(/a/b[0])', json);
      assert.equal(val.getNumber(), 0);
    });
    it('count(/a/b[5])', () => {
      const val = evaluate('count(/a/b[5])', json);
      assert.equal(val.getNumber(), 0);
    });
  });
  describe('filters on {"a":{"b":{"c":{"e":1}},"d":{"f":{"e":1}}}}', () => {
    const json = '{"a":{"b":{"c":{"e":1}},"d":{"f":{"e":1}}}}';
    it('count(/a/*[count(c) > 0])', () => {
      const val = evaluate('count(/a/*[count(c) > 0])', json);
      assert.equal(val.getNumber(), 1);
    });
    it('count(/a/*/*[local-name(..) = \'b\'])', () => {
      const val = evaluate('count(/a/*/*[local-name(..) = \'b\'])', json);
      assert.equal(val.getNumber(), 1);
    });
    it('count(/a/*[count(*[local-name(.) = \'c\']) > 0])', () => {
      const val = evaluate('count(/a/*[count(*[local-name(.) = \'c\']) > 0])', json);
      assert.equal(val.getNumber(), 1);
    });
  });
  describe('filters on {"a":{"b":[{"c":{"e":1}},{"d":{"e":2}}]}}', () => {
    const json = '{"a":{"b":[{"c":{"e":1}},{"d":{"e":2}}]}}';
    it('count(/a/b[count(.//e) = 1])', () => {
      const val = evaluate('count(/a/b[count(.//e) = 1])', json);
      assert.equal(val.getNumber(), 2);
    });
    it('count(/a/b[count(//e) = 2])', () => {
      const val = evaluate('count(/a/b[count(//e) = 2])', json);
      assert.equal(val.getNumber(), 2);
    });
    it('count(//*[local-name(.) = \'d\'])', () => {
      const val = evaluate('count(//*[local-name(.) = \'d\'])', json);
      assert.equal(val.getNumber(), 1);
    });
    // TODO:
    // count(/a/*[count(following-sibling::*) = 1])
    // /a/*[count(following-sibling::*) = 1]
  });
  describe('filters on primitive values', () => {
    const json = '{"a":{"b":[1, 2, 3, 4]}}';
    it('(1 + 2)[. = 3]', () => {
      const val = evaluate('(1 + 2)[. = 3]', json);
      assert.equal(val.getBoolean(), true);
    });
    it('1[count(/a/b) = 4]', () => {
      const val = evaluate('1[count(/a/b) = 4]', json);
      assert.equal(val.getNumber(), 1);
    });
  });
});

describe('nodeset functions', () => {
  const json = '{"a":3}';
  it('/a[position()=1]', () => {
    const val = evaluate('/a[position()=1]', json);
    assert.equal(val.getNumber(), 3);
  });
  it('/a[position()=last()]', () => {
    const val = evaluate('/a[position()=last()]', json);
    assert.equal(val.getStringValue(), '3');
  });
  it('local-name(/a[position()=last()])', () => {
    const val = evaluate('local-name(/a[position()=last()])', json);
    assert.equal(val.getStringValue(), 'a');
  });
  it('count(/a[position()=0])', () => {
    const val = evaluate('count(/a[position()=0])', json);
    assert.equal(val.getNumber(), 0);
  });
  it('count(/a[position()=2])', () => {
    const val = evaluate('count(/a[position()=2])', json);
    assert.equal(val.getNumber(), 0);
  });
});

describe('string functions', () => {
  describe('string on {"a":3}', () => {
    const json = '{"a":3}';
    it('string(/)', () => {
      const val = evaluate('string(/)', json);
      assert.equal(val.getString(), '3');
      assert.equal(val.getStringValue(), '3');
    });
    it('string(/a)', () => {
      const val = evaluate('string(/a)', json);
      assert.equal(val.getString(), '3');
    });
  });
  describe('string on {"a":{"b":3,"c":1}}', () => {
    const json = '{"a":{"b":3,"c":1}}';
    it('string(/)', () => {
      const val = evaluate('string(/)', json);
      assert.equal(val.getString(), '31');
    });
    it('string(/a)', () => {
      const val = evaluate('string(/a)', json);
      assert.equal(val.getString(), '31');
    });
    it('string(/a/b)', () => {
      const val = evaluate('string(/a/b)', json);
      assert.equal(val.getString(), '3');
    });
    it('string(/a/c)', () => {
      const val = evaluate('string(/a/c)', json);
      assert.equal(val.getString(), '1');
    });
  });
  describe('string on {"a":{"b":{"c":{"e":1}},"d":{"c":{"e":1}}}}', () => {
    const json = '{"a":{"b":{"c":{"e":1}},"d":{"c":{"e":1}}}}';
    it('string(/)', () => {
      const val = evaluate('string(/)', json);
      assert.equal(val.getString(), '11');
    });
    it('string(/a)', () => {
      const val = evaluate('string(/a)', json);
      assert.equal(val.getString(), '11');
    });
    it('string(/a/b)', () => {
      const val = evaluate('string(/a/b)', json);
      assert.equal(val.getString(), '1');
    });
    it('string(/a/b/c)', () => {
      const val = evaluate('string(/a/b/c)', json);
      assert.equal(val.getString(), '1');
    });
    it('string(/a/b/c/e)', () => {
      const val = evaluate('string(/a/b/c/e)', json);
      assert.equal(val.getString(), '1');
    });
    it('string(/a/b/c/e/z)', () => {
      const val = evaluate('string(/a/b/c/e/z)', json);
      assert.equal(val.getString(), '');
    });
  });
  describe('string on {"a":{"b":1,"c":true,"d":"foo"}}', () => {
    const json = '{"a":{"b":1,"c":true,"d":"foo"}}';
    it('string(/)', () => {
      const val = evaluate('string(/)', json);
      assert.equal(val.getString(), '1truefoo');
    });
    it('string(/a)', () => {
      const val = evaluate('string(/a)', json);
      assert.equal(val.getString(), '1truefoo');
    });
    it('string(/a/b)', () => {
      const val = evaluate('string(/a/b)', json);
      assert.equal(val.getString(), '1');
    });
    it('string(/a/c)', () => {
      const val = evaluate('string(/a/c)', json);
      assert.equal(val.getString(), 'true');
    });
    it('string(/a/d)', () => {
      const val = evaluate('string(/a/d)', json);
      assert.equal(val.getString(), 'foo');
    });
  });
  describe('string on {"a":{"b":[1,2,3,4]}}', () => {
    const json = '{"a":{"b":[1,2,3,4]}}';
    it('string(/)', () => {
      const val = evaluate('string(/)', json);
      assert.equal(val.getString(), '1234');
    });
    it('string(/a)', () => {
      const val = evaluate('string(/a)', json);
      assert.equal(val.getString(), '1234');
    });
    it('string(/a/b)', () => {
      const val = evaluate('string(/a/b)', json);
      assert.equal(val.getString(), '1');
    });
    it('string(/a/b)', () => {
      const val = evaluate('string(//b)', json);
      assert.equal(val.getString(), '1');
    });
  });
  describe('concat on {"a":{"b":[1,2,3,4]}}', () => {
    const json = '{"a":{"b":[1,2,3,4]}}';
    it('concat(/, "")', () => {
      const val = evaluate('concat(/, "")', json);
      assert.equal(val.getString(), '1234');
    });
    it('concat(/, "5", 6)', () => {
      const val = evaluate('concat(/, "5", 6)', json);
      assert.equal(val.getString(), '123456');
    });
  });
  describe('starts-with on {"a":{"b":[1,2,3,4]}}', () => {
    const json = '{"a":{"b":[1,2,3,4]}}';
    it('starts-with(/, "")', () => {
      const val = evaluate('starts-with(/, "")', json);
      assert.equal(val.getBoolean(), true);
    });
    it('starts-with(/, "12")', () => {
      const val = evaluate('starts-with(/, "12")', json);
      assert.equal(val.getBoolean(), true);
    });
    it('starts-with(/, "1234")', () => {
      const val = evaluate('starts-with(/, "1234")', json);
      assert.equal(val.getBoolean(), true);
    });
    it('starts-with("foo", "bar")', () => {
      const val = evaluate('starts-with("foo", "bar")', json);
      assert.equal(val.getBoolean(), false);
    });
  });
  describe('contains on {"a":{"b":[1,2,3,4]}}', () => {
    const json = '{"a":{"b":[1,2,3,4]}}';
    it('contains(/, "")', () => {
      const val = evaluate('contains(/, "")', json);
      assert.equal(val.getBoolean(), true);
    });
    it('contains(/, "12")', () => {
      const val = evaluate('contains(/, "12")', json);
      assert.equal(val.getBoolean(), true);
    });
    it('contains(/, "23")', () => {
      const val = evaluate('contains(/, "23")', json);
      assert.equal(val.getBoolean(), true);
    });
    it('contains("foo", "bar")', () => {
      const val = evaluate('contains("foo", "bar")', json);
      assert.equal(val.getBoolean(), false);
    });
  });
  describe('substring-before on {"a":{"b":[1,2,3,4]}}', () => {
    const json = '{"a":{"b":[1,2,3,4]}}';
    it('substring-before(/, "4")', () => {
      const val = evaluate('substring-before(/, "4")', json);
      assert.equal(val.getString(), '123');
    });
    it('(substring-before/, "1")', () => {
      const val = evaluate('substring-before(/, "1")', json);
      assert.equal(val.getString(), '');
    });
    it('(substring-before/, "")', () => {
      const val = evaluate('substring-before(/, "")', json);
      assert.equal(val.getString(), '');
    });
  });
  describe('substring-after on {"a":{"b":[1,2,3,4]}}', () => {
    const json = '{"a":{"b":[1,2,3,4]}}';
    it('substring-after(/, "12")', () => {
      const val = evaluate('substring-after(/, "12")', json);
      assert.equal(val.getString(), '34');
    });
    it('(substring-after/, "4")', () => {
      const val = evaluate('substring-after(/, "4")', json);
      assert.equal(val.getString(), '');
    });
    it('(substring-after/, "")', () => {
      const val = evaluate('substring-after(/, "")', json);
      assert.equal(val.getString(), '1234');
    });
  });
  describe('substring on {"a":{"b":[1,2,3,4]}}', () => {
    const json = '{"a":{"b":[1,2,3,4]}}';
    it('substring(/, 2)', () => {
      const val = evaluate('substring(/, 2)', json);
      assert.equal(val.getString(), '234');
    });
    it('substring(/, 4)', () => {
      const val = evaluate('substring(/, 4)', json);
      assert.equal(val.getString(), '4');
    });
    it('substring("12345", 2, 3)', () => {
      const val = evaluate('substring("12345", 2, 3)', json);
      assert.equal(val.getString(), '234');
    });
    it('substring("12345", 1.5, 2.6)', () => {
      const val = evaluate('substring("12345", 2, 3)', json);
      assert.equal(val.getString(), '234');
    });
    it('substring("12345", 0, 3)', () => {
      const val = evaluate('substring("12345", 0, 3)', json);
      assert.equal(val.getString(), '12');
    });
    it('substring("12345", 0 div 0, 3)', () => {
      const val = evaluate('substring("12345", 0 div 0, 3)', json);
      assert.equal(val.getString(), '');
    });
    it('substring("12345", 1, 0 div 0)', () => {
      const val = evaluate('substring("12345", 1, 0 div 0)', json);
      assert.equal(val.getString(), '');
    });
    it('substring("12345", -42)', () => {
      const val = evaluate('substring("12345", -42)', json);
      assert.equal(val.getString(), '12345');
    });
    it('substring("12345", -42, 1 div 0)', () => {
      const val = evaluate('substring("12345", -42, 1 div 0)', json);
      assert.equal(val.getString(), '12345');
    });
    it('substring("12345", -42, 1 div 0)', () => {
      const val = evaluate('substring("12345", -42, 1 div 0)', json);
      assert.equal(val.getString(), '12345');
    });
    it('substring("12345", 1 div 0, 1 div 0)', () => {
      const val = evaluate('substring("12345", 1  div 0, 1 div 0)', json);
      assert.equal(val.getString(), '');
    });
  });
});
