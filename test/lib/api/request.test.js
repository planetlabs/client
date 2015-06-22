/* eslint-env mocha */
var http = require('http');
var https = require('https');

var chai = require('chai');
var sinon = require('sinon');

var auth = require('../../../lib/api/auth');
var errors = require('../../../lib/api/errors');
var req = require('../../../lib/api/request');

chai.config.truncateThreshold = 0;
var assert = chai.assert;

describe('request', function() {

  var httpRequest = http.request;
  var httpsRequest = https.request;
  var mockRequest = null;

  beforeEach(function() {
    mockRequest = {
      end: sinon.spy(),
      abort: sinon.spy()
    };
    http.request = sinon.spy(function() {
      return mockRequest;
    });
    https.request = sinon.spy(function() {
      return mockRequest;
    });
  });

  afterEach(function() {
    http.request = httpRequest;
    https.request = httpsRequest;
    mockRequest = null;
    auth.clear();
  });

  describe('request()', function() {
    var request = req.request;

    it('returns a promise', function() {
      var promise = request({url: 'https://example.com'});
      assert.instanceOf(promise, Promise);
    });

    it('calls http.request() with options and callback', function() {
      request({url: 'http://example.com'});

      assert.equal(http.request.callCount, 1);
      var call = http.request.getCall(0);
      assert.lengthOf(call.args, 2);

      assert.deepEqual(call.args[0], {
        protocol: 'http:',
        hostname: 'example.com',
        port: '80',
        method: 'GET',
        path: '/',
        headers: {accept: 'application/json'}
      });

      assert.typeOf(call.args[1], 'function');
    });

    it('uses https.request() for https URLs', function() {
      request({url: 'https://example.com'});
      assert.equal(https.request.callCount, 1);
    });

    it('accepts a terminator for aborting requests', function(done) {
      var promise = request({
        url: 'http//example.com',
        terminator: function(abort) {
          setTimeout(abort, 10);
        }
      });
      promise.then(function() {
        done(new Error('Expected promise to be rejected'));
      }).catch(function(err) {
        assert.instanceOf(err, errors.AbortedRequest);
        assert.equal(mockRequest.abort.callCount, 1);
        done();
      });
    });

  });

  describe('get()', function() {

    it('calls request() with method set to GET', function() {
      req.get({url: 'http://example.com'});
      assert.equal(http.request.callCount, 1);
      var call = http.request.getCall(0);
      assert.lengthOf(call.args, 2);
      var config = call.args[0];
      assert.equal(config.method, 'GET');
    });

    it('accepts a string for the URL', function() {
      req.get('http://example.com');
      assert.equal(http.request.callCount, 1);
      var call = http.request.getCall(0);
      assert.lengthOf(call.args, 2);
      var config = call.args[0];
      assert.equal(config.method, 'GET');
      assert.equal(config.hostname, 'example.com');
    });

  });

  describe('parseConfig()', function() {

    var parseConfig = req.parseConfig;
    var defaultHeaders = {'accept': 'application/json'};

    it('generates request options from a URL', function() {
      var config = {
        url: 'http://example.com'
      };
      var options = {
        protocol: 'http:',
        hostname: 'example.com',
        port: '80',
        method: 'GET',
        path: '/',
        headers: defaultHeaders
      };

      assert.deepEqual(parseConfig(config), options);
    });

    it('uses the correct default port for https', function() {
      var config = {
        url: 'https://example.com'
      };
      var options = {
        protocol: 'https:',
        hostname: 'example.com',
        port: '443',
        method: 'GET',
        path: '/',
        headers: defaultHeaders
      };

      assert.deepEqual(parseConfig(config), options);
    });

    it('respects the port in the URL', function() {
      var config = {
        url: 'http://example.com:8000'
      };
      var options = {
        protocol: 'http:',
        hostname: 'example.com',
        port: '8000',
        method: 'GET',
        path: '/',
        headers: defaultHeaders
      };

      assert.deepEqual(parseConfig(config), options);
    });

    it('respects a query string in the URL', function() {
      var config = {
        url: 'http://example.com/page?foo=bar'
      };
      var options = {
        protocol: 'http:',
        hostname: 'example.com',
        port: '80',
        method: 'GET',
        path: '/page?foo=bar',
        headers: defaultHeaders
      };

      assert.deepEqual(parseConfig(config), options);
    });

    it('accepts a config with url and query', function() {
      var config = {
        url: 'http://example.com/page',
        query: {
          foo: 'bar bam'
        }
      };
      var options = {
        protocol: 'http:',
        hostname: 'example.com',
        port: '80',
        method: 'GET',
        path: '/page?foo=bar%20bam',
        headers: defaultHeaders
      };

      assert.deepEqual(parseConfig(config), options);
    });

    it('extends an existing URL query string with query object', function() {
      var config = {
        url: 'http://example.com/page?foo=bar',
        query: {
          bam: 'baz'
        }
      };
      var options = {
        protocol: 'http:',
        hostname: 'example.com',
        port: '80',
        method: 'GET',
        path: '/page?foo=bar&bam=baz',
        headers: defaultHeaders
      };

      assert.deepEqual(parseConfig(config), options);
    });

    it('allows query object to override query string', function() {
      var config = {
        url: 'http://example.com/?foo=bar',
        query: {
          foo: 'bam'
        }
      };
      var options = {
        protocol: 'http:',
        hostname: 'example.com',
        port: '80',
        method: 'GET',
        path: '/?foo=bam',
        headers: defaultHeaders
      };

      assert.deepEqual(parseConfig(config), options);
    });

    it('passes along the withCredentials option', function() {
      var config = {
        url: 'http://example.com/',
        withCredentials: false
      };
      var options = {
        protocol: 'http:',
        hostname: 'example.com',
        port: '80',
        method: 'GET',
        path: '/',
        headers: defaultHeaders,
        withCredentials: false
      };

      assert.deepEqual(parseConfig(config), options);
    });

    it('adds authorization header with stored API key', function() {
      var key = 'my-key';
      auth.setKey(key);
      var config = {
        url: 'http://example.com/'
      };
      var options = parseConfig(config);

      var headers = options.headers;
      assert.equal(headers.authorization, 'api-key ' + key);
    });

  });

});
