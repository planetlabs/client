/* eslint-env jest */

var util = require('../../api/util');

describe('api/util', function() {
  describe('addQueryParams()', function() {
    it('adds params from a query object', function() {
      var cases = [
        {
          url: 'http://example.com/',
          query: {
            foo: 'bar'
          },
          expect: 'http://example.com/?foo=bar'
        },
        {
          url: 'http://example.com/?foo=bam',
          query: {
            baz: 'bar'
          },
          expect: 'http://example.com/?foo=bam&baz=bar'
        },
        {
          url: 'http://example.com/?foo=bam',
          query: {
            foo: 'bar'
          },
          expect: 'http://example.com/?foo=bar'
        },
        {
          url: 'http://example.com/#anchor',
          query: {
            foo: 'bar'
          },
          expect: 'http://example.com/?foo=bar#anchor'
        },
        {
          url: 'http://example.com/?bam=baz#anchor',
          query: {
            foo: 'bar'
          },
          expect: 'http://example.com/?bam=baz&foo=bar#anchor'
        },
        {
          url: 'http://example.com/?foo=bam#anchor',
          query: {
            foo: 'bar'
          },
          expect: 'http://example.com/?foo=bar#anchor'
        }
      ];

      var add = util.addQueryParams;
      for (var i = 0, ii = cases.length; i < ii; ++i) {
        var c = cases[i];
        expect(add(c.url, c.query)).toEqual(c.expect);
      }
    });
  });

  describe('assign()', function() {
    it('assigns source properties to target object', function() {
      var source = {
        foo: 'bar'
      };
      var target = {
        num: 42
      };

      util.assign(target, source);
      expect(target).toEqual({
        foo: 'bar',
        num: 42
      });
    });

    it('returns the target object', function() {
      var target = {};

      var got = util.assign(target, {foo: 'bar'});
      expect(got).toEqual(target);
    });

    it('overwrites target properties', function() {
      var target = {
        foo: 'bar'
      };

      util.assign(target, {foo: 'bam'});
      expect(target.foo).toEqual('bam');
    });

    it('works with multiple sources', function() {
      var target = {
        foo: 'bar'
      };
      var source1 = {
        foo1: 'bar1'
      };
      var source2 = {
        foo2: 'bar2'
      };

      util.assign(target, source1, source2);
      expect(target).toEqual({
        foo: 'bar',
        foo1: 'bar1',
        foo2: 'bar2'
      });
    });

    it('prefers later sources, does not modify earlier ones', function() {
      var target = {
        foo: 'bar'
      };
      var source1 = {
        foo: 'bam'
      };
      var source2 = {
        foo: 'baz'
      };

      util.assign(target, source1, source2);
      expect(target).toEqual({foo: 'baz'});
      expect(source1).toEqual({foo: 'bam'});
    });
  });
});
