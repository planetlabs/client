/* eslint-env mocha */

var assert = require('chai').assert;

var urls = require('../../api/urls');

describe('api/urls', function() {

  describe('join()', function() {

    it('joins URL parts', function() {
      var cases = [{
        actual: urls.join('http://example.com', 'foo'),
        expected: 'http://example.com/foo'
      }, {
        actual: urls.join('http://example.com', 'foo', 'bar'),
        expected: 'http://example.com/foo/bar'
      }, {
        actual: urls.join('http://example.com', 'foo', 'bar', 'bam'),
        expected: 'http://example.com/foo/bar/bam'
      }, {
        actual: urls.join('http://example.com', 'foo', 'bar', 'bam', ''),
        expected: 'http://example.com/foo/bar/bam/'
      }];

      for (var i = 0, ii = cases.length; i < ii; ++i) {
        var c = cases[i];
        assert.deepEqual(c.actual, c.expected, 'case ' + i);
      }
    });

    it('removes extra slashes', function() {
      var cases = [{
        actual: urls.join('http://example.com/', 'foo'),
        expected: 'http://example.com/foo'
      }, {
        actual: urls.join('http://example.com/', '/foo', 'bar'),
        expected: 'http://example.com/foo/bar'
      }, {
        actual: urls.join('http://example.com', 'foo/', '/bar/', 'bam/'),
        expected: 'http://example.com/foo/bar/bam'
      }];

      for (var i = 0, ii = cases.length; i < ii; ++i) {
        var c = cases[i];
        assert.deepEqual(c.actual, c.expected, 'case ' + i);
      }
    });

    it('works with numbers', function() {
      var cases = [{
        actual: urls.join('http://example.com', 42),
        expected: 'http://example.com/42'
      }, {
        actual: urls.join('http://example.com', 0, 'foo'),
        expected: 'http://example.com/0/foo'
      }, {
        actual: urls.join('http://example.com', 10, 'bar', 20),
        expected: 'http://example.com/10/bar/20'
      }];

      for (var i = 0, ii = cases.length; i < ii; ++i) {
        var c = cases[i];
        assert.deepEqual(c.actual, c.expected, 'case ' + i);
      }
    });

    it('throws for invalid input', function() {
      function call() {
        urls.join('http://example.com', new Date());
      }
      assert.throws(call, Error, 'join must be called with strings or numbers');
    });

  });

});
