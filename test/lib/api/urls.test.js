/* eslint-env mocha */

var assert = require('chai').assert;

var urls = require('../../../lib/api/urls');

describe('urls', function() {

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

  });

});
