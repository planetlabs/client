/* eslint-env mocha */
var assert = require('chai').assert;

var util = require('../../api/util');

describe('api/util', function() {

  describe('addQueryParams()', function() {

    it('adds params from a query object', function() {

      var cases = [{
        url: 'http://example.com/',
        query: {
          foo: 'bar'
        },
        expect: 'http://example.com/?foo=bar'
      }, {
        url: 'http://example.com/?foo=bam',
        query: {
          baz: 'bar'
        },
        expect: 'http://example.com/?foo=bam&baz=bar'
      }, {
        url: 'http://example.com/?foo=bam',
        query: {
          foo: 'bar'
        },
        expect: 'http://example.com/?foo=bar'
      }, {
        url: 'http://example.com/#anchor',
        query: {
          foo: 'bar'
        },
        expect: 'http://example.com/?foo=bar#anchor'
      }, {
        url: 'http://example.com/?bam=baz#anchor',
        query: {
          foo: 'bar'
        },
        expect: 'http://example.com/?bam=baz&foo=bar#anchor'
      }, {
        url: 'http://example.com/?foo=bam#anchor',
        query: {
          foo: 'bar'
        },
        expect: 'http://example.com/?foo=bar#anchor'
      }];

      var add = util.addQueryParams;
      for (var i = 0, ii = cases.length; i < ii; ++i) {
        var c = cases[i];
        assert.equal(add(c.url, c.query), c.expect, 'case ' + i);
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
      assert.deepEqual(target, {
        foo: 'bar',
        num: 42
      });
    });

    it('returns the target object', function() {
      var target = {};

      var got = util.assign(target, {foo: 'bar'});
      assert.equal(got, target);
    });

    it('overwrites target properties', function() {
      var target = {
        foo: 'bar'
      };

      util.assign(target, {foo: 'bam'});
      assert.equal(target.foo, 'bam');
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
      assert.deepEqual(target, {
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
      assert.deepEqual(target, {foo: 'baz'});
      assert.deepEqual(source1, {foo: 'bam'});
    });

  });

});
