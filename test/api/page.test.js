/* eslint-env mocha */
var url = require('url');

var assert = require('chai').assert;
var sinon = require('sinon');

var Page = require('../../api/page');

describe('api/page', function() {

  var spy;
  beforeEach(function() {
    spy = sinon.spy();
  });

  describe('constructor', function() {

    it('creates a new page given data and a factory function', function() {
      var page = new Page({links: {}}, spy);
      assert.instanceOf(page, Page);
    });

  });

  describe('#data', function() {

    it('provides access to page data', function() {
      var data = {links: {}};
      var page = new Page(data, spy);
      assert.deepEqual(page.data, data);
    });

  });

  describe('#next()', function() {

    it('calls the factory with a query from the next url', function() {
      var query = {
        foo: 'bar',
        num: '42'
      };

      var data = {
        links: {
          next: url.format({
            query: query
          })
        }
      };

      var page = new Page(data, spy);
      assert.typeOf(page.next, 'function');
      page.next();
      assert.equal(spy.callCount, 1);
      var call = spy.getCall(0);
      assert.deepEqual(call.args[0], query);
    });

    it('passes along options as second arg to factory', function() {
      var data = {
        links: {
          next: 'http://example.com'
        }
      };

      var page = new Page(data, spy);
      assert.typeOf(page.next, 'function');

      var options = {};
      page.next(options);
      assert.equal(spy.callCount, 1);
      var call = spy.getCall(0);
      assert.equal(call.args[1], options);
    });

  });

  describe('#prev()', function() {

    it('is only assigned if data includes prev link', function() {
      var query = {
        foo: 'bar',
        num: '42'
      };

      var data = {
        links: {
          next: url.format({
            query: query
          })
        }
      };

      var page = new Page(data, spy);
      assert.isNull(page.prev);
    });

    it('calls the factory with a query from the prev url', function() {
      var query = {
        foo: 'bar',
        num: '42'
      };

      var data = {
        links: {
          prev: url.format({
            query: query
          })
        }
      };

      var page = new Page(data, spy);
      assert.typeOf(page.prev, 'function');
      page.prev();
      assert.equal(spy.callCount, 1);
      var call = spy.getCall(0);
      assert.deepEqual(call.args[0], query);
    });

    it('passes along options as second arg to factory', function() {
      var data = {
        links: {
          prev: 'http://example.com'
        }
      };

      var page = new Page(data, spy);
      assert.typeOf(page.prev, 'function');

      var options = {};
      page.prev(options);
      assert.equal(spy.callCount, 1);
      var call = spy.getCall(0);
      assert.equal(call.args[1], options);
    });

  });

});
