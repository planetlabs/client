/* eslint-env mocha */
const assert = require('chai').assert;

const util = require('../../api/util');

describe('api/util', function () {
  describe('addQueryParams()', function () {
    it('adds params from a query object', function () {
      const cases = [
        {
          url: 'http://example.com/',
          query: {
            foo: 'bar',
          },
          expect: 'http://example.com/?foo=bar',
        },
        {
          url: 'http://example.com/?foo=bam',
          query: {
            baz: 'bar',
          },
          expect: 'http://example.com/?foo=bam&baz=bar',
        },
        {
          url: 'http://example.com/?foo=bam',
          query: {
            foo: 'bar',
          },
          expect: 'http://example.com/?foo=bar',
        },
        {
          url: 'http://example.com/#anchor',
          query: {
            foo: 'bar',
          },
          expect: 'http://example.com/?foo=bar#anchor',
        },
        {
          url: 'http://example.com/?bam=baz#anchor',
          query: {
            foo: 'bar',
          },
          expect: 'http://example.com/?bam=baz&foo=bar#anchor',
        },
        {
          url: 'http://example.com/?foo=bam#anchor',
          query: {
            foo: 'bar',
          },
          expect: 'http://example.com/?foo=bar#anchor',
        },
      ];

      const add = util.addQueryParams;
      for (let i = 0, ii = cases.length; i < ii; ++i) {
        const c = cases[i];
        assert.equal(add(c.url, c.query), c.expect, 'case ' + i);
      }
    });
  });

  describe('assign()', function () {
    it('assigns source properties to target object', function () {
      const source = {
        foo: 'bar',
      };
      const target = {
        num: 42,
      };

      util.assign(target, source);
      assert.deepEqual(target, {
        foo: 'bar',
        num: 42,
      });
    });

    it('returns the target object', function () {
      const target = {};

      const got = util.assign(target, {foo: 'bar'});
      assert.equal(got, target);
    });

    it('overwrites target properties', function () {
      const target = {
        foo: 'bar',
      };

      util.assign(target, {foo: 'bam'});
      assert.equal(target.foo, 'bam');
    });

    it('works with multiple sources', function () {
      const target = {
        foo: 'bar',
      };
      const source1 = {
        foo1: 'bar1',
      };
      const source2 = {
        foo2: 'bar2',
      };

      util.assign(target, source1, source2);
      assert.deepEqual(target, {
        foo: 'bar',
        foo1: 'bar1',
        foo2: 'bar2',
      });
    });

    it('prefers later sources, does not modify earlier ones', function () {
      const target = {
        foo: 'bar',
      };
      const source1 = {
        foo: 'bam',
      };
      const source2 = {
        foo: 'baz',
      };

      util.assign(target, source1, source2);
      assert.deepEqual(target, {foo: 'baz'});
      assert.deepEqual(source1, {foo: 'bam'});
    });
  });
});
