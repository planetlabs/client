/* eslint-env mocha */
var http = require('http');
var https = require('https');
var stream = require('stream');
var url = require('url');

var chai = require('chai');
var sinon = require('sinon');

var authStore = require('../../api/auth-store');
var assign = require('../../api/util').assign;
var errors = require('../../api/errors');
var req = require('../../api/request');
var util = require('../../api/util');

chai.config.truncateThreshold = 0;
var assert = chai.assert;

describe('api/request', function() {

  var httpRequest = http.request;
  var httpsRequest = https.request;
  var mockRequest = null;

  beforeEach(function() {
    mockRequest = {
      end: sinon.spy(),
      abort: sinon.spy()
    };
    var httpRequestMock = http.request = sinon.spy(function() {
      return mockRequest;
    });
    var httpsRequestMock = https.request = sinon.spy(function() {
      return mockRequest;
    });

    // When doing browser testing via mochify the http/s module required by
    // request.js doesn't invoke the mock we've defined above.
    httpRequestMock.get = http.get = sinon.spy(function() {
      arguments[0].method = 'GET';
      return httpRequestMock.apply(this, arguments);
    });
    httpsRequestMock.get = https.get = sinon.spy(function() {
      arguments[0].method = 'GET';
      return httpsRequestMock.apply(this, arguments);
    });
  });

  afterEach(function() {
    http.request = httpRequest;
    https.request = httpsRequest;
    mockRequest = null;
    authStore.clear();
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

    it('resolves to an object with body and response', function(done) {
      var response = new stream.Readable();
      response.statusCode = 200;
      var body = {
        foo: 'bar'
      };

      var promise = request({url: 'http://example.com'});
      promise.then(function(obj) {
        assert.equal(obj.response, response);
        assert.deepEqual(obj.body, body);
        done();
      }).catch(done);

      assert.equal(http.request.callCount, 1);
      var args = http.request.getCall(0).args;
      assert.lengthOf(args, 2);
      var callback = args[1];
      callback(response);
      response.emit('data', JSON.stringify(body));
      response.emit('end');
    });

    it('follows location header on 302', function(done) {
      var firstResponse = new stream.Readable();
      firstResponse.statusCode = 302;
      firstResponse.headers = {
        location: 'https://redirect.com'
      };

      var secondResponse = new stream.Readable();
      secondResponse.statusCode = 200;
      var body = {
        foo: 'bar'
      };

      var promise = request({
        url: 'https://example.com'
      });
      promise.then(function(obj) {
        assert.equal(obj.response, secondResponse);
        assert.deepEqual(obj.body, body);
        done();
      }).catch(done);

      assert.equal(https.request.callCount, 1);
      var firstCallback = https.request.getCall(0).args[1];
      firstCallback(firstResponse);
      firstResponse.emit('end');

      assert.equal(https.request.callCount, 2);
      var secondCallback = https.request.getCall(1).args[1];
      secondCallback(secondResponse);
      secondResponse.emit('data', JSON.stringify(body));
      secondResponse.emit('end');
    });

    it('resolves before parsing body if stream is true', function(done) {
      var response = new stream.Readable();
      response.statusCode = 200;
      var body = {
        foo: 'bar'
      };

      var promise = request({
        url: 'http://example.com',
        stream: true
      });
      promise.then(function(obj) {
        assert.equal(obj.response, response);
        assert.isNull(obj.body);
        done();
      }).catch(done);

      assert.equal(http.request.callCount, 1);
      var args = http.request.getCall(0).args;
      assert.lengthOf(args, 2);
      var callback = args[1];
      callback(response);
      response.emit('data', JSON.stringify(body));
      response.emit('end');
    });

    it('rejects on non 2xx if stream is true', function(done) {
      var response = new stream.Readable();
      response.statusCode = 502;
      var body = 'too much request';

      var promise = request({
        url: 'http://example.com',
        stream: true
      });
      promise.then(function(obj) {
        done(new Error('Expected rejection'));
      }, function(err) {
        assert.instanceOf(err, errors.UnexpectedResponse);
        assert.include(err.message, 'Unexpected response status: 502');
        done();
      }).catch(done);

      assert.equal(http.request.callCount, 1);
      var args = http.request.getCall(0).args;
      assert.lengthOf(args, 2);
      var callback = args[1];
      callback(response);
      response.emit('data', JSON.stringify(body));
      response.emit('end');
    });

    it('rejects for invalid JSON in successful response', function(done) {
      var response = new stream.Readable();
      response.statusCode = 200;
      var body = 'garbage response body';

      var promise = request({url: 'http://example.com'});
      promise.then(function(obj) {
        done(new Error('Expected promise to be rejected'));
      }, function(err) {
        assert.instanceOf(err, errors.UnexpectedResponse);
        assert.include(err.message, 'Trouble parsing response body as JSON');
        assert.equal(err.body, body);
        done();
      }).catch(done);

      assert.equal(http.request.callCount, 1);
      var args = http.request.getCall(0).args;
      assert.lengthOf(args, 2);
      var callback = args[1];
      callback(response);
      response.emit('data', body);
      response.emit('end');
    });

    it('rejects with UnexpectedResponse for 500 response', function(done) {
      var response = new stream.Readable();
      response.statusCode = 500;
      var body = 'server error (maybe a secret in the stack trace)';

      var promise = request({url: 'http://example.com'});
      promise.then(function(obj) {
        done(new Error('Expected promise to be rejected'));
      }, function(err) {
        assert.instanceOf(err, errors.UnexpectedResponse);
        assert.include(err.message, 'Unexpected response status: 500');
        assert.equal(err.body, null); // don't leak unexpected responses
        done();
      }).catch(done);

      assert.equal(http.request.callCount, 1);
      var args = http.request.getCall(0).args;
      assert.lengthOf(args, 2);
      var callback = args[1];
      callback(response);
      response.emit('data', body);
      response.emit('end');
    });

    it('rejects with BadRequest for 400', function(done) {
      var response = new stream.Readable();
      response.statusCode = 400;
      var body = {message: 'Invalid email or password', errors: []};

      var promise = request({url: 'http://example.com'});
      promise.then(function(obj) {
        done(new Error('Expected promise to be rejected'));
      }, function(err) {
        assert.instanceOf(err, errors.BadRequest);
        assert.include(err.message, 'Bad request');
        assert.deepEqual(err.body, body);
        done();
      }).catch(done);

      assert.equal(http.request.callCount, 1);
      var args = http.request.getCall(0).args;
      assert.lengthOf(args, 2);
      var callback = args[1];
      callback(response);
      response.emit('data', JSON.stringify(body));
      response.emit('end');
    });

    it('rejects with Unauthorized for 401', function(done) {
      var response = new stream.Readable();
      response.statusCode = 401;
      var body = {message: 'Invalid email or password', errors: []};

      var promise = request({url: 'http://example.com'});
      promise.then(function(obj) {
        done(new Error('Expected promise to be rejected'));
      }, function(err) {
        assert.instanceOf(err, errors.Unauthorized);
        assert.include(err.message, 'Unauthorized');
        assert.deepEqual(err.body, body);
        done();
      }).catch(done);

      assert.equal(http.request.callCount, 1);
      var args = http.request.getCall(0).args;
      assert.lengthOf(args, 2);
      var callback = args[1];
      callback(response);
      response.emit('data', JSON.stringify(body));
      response.emit('end');
    });

    it('rejects with Forbidden for 403', function(done) {
      var response = new stream.Readable();
      response.statusCode = 403;
      var body = {message: 'some user info here'};

      var promise = request({url: 'http://example.com'});
      promise.then(function(obj) {
        done(new Error('Expected promise to be rejected'));
      }, function(err) {
        assert.instanceOf(err, errors.Forbidden);
        assert.include(err.message, 'Forbidden');
        assert.deepEqual(err.body, body);
        done();
      }).catch(done);

      assert.equal(http.request.callCount, 1);
      var args = http.request.getCall(0).args;
      assert.lengthOf(args, 2);
      var callback = args[1];
      callback(response);
      response.emit('data', JSON.stringify(body));
      response.emit('end');
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

    it('calls request.xhr.abort() if request.abort is absent', function(done) {
      var promise = request({
        url: 'http//example.com',
        terminator: function(abort) {
          setTimeout(abort, 10);
        }
      });

      delete mockRequest.abort;
      mockRequest.xhr = {
        abort: sinon.spy()
      };

      promise.then(function() {
        done(new Error('Expected promise to be rejected'));
      }).catch(function(err) {
        assert.instanceOf(err, errors.AbortedRequest);
        assert.equal(mockRequest.xhr.abort.callCount, 1);
        done();
      });
    });

    it('allows termination on partial response', function(done) {
      var response = new stream.Readable();
      response.statusCode = 200;
      var body = 'partial body';

      var promise = request({
        url: 'http//example.com',
        terminator: function(abort) {
          setTimeout(abort, 10);
        }
      });

      var rejected = false;
      promise.then(function() {
        done(new Error('Expected promise to be rejected'));
      }).catch(function(err) {
        rejected = true;
        assert.instanceOf(err, errors.AbortedRequest);
        assert.equal(mockRequest.abort.callCount, 1);
      });

      assert.equal(http.request.callCount, 1);
      var args = http.request.getCall(0).args;
      assert.lengthOf(args, 2);
      var callback = args[1];
      callback(response);
      response.emit('data', body);
      setTimeout(function() {
        response.emit('end');
        assert.equal(rejected, true);
        done();
      }, 20);
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

  describe('post()', function() {

    it('calls request() with method set to POST', function() {
      req.post({url: 'http://example.com'});
      assert.equal(http.request.callCount, 1);
      var call = http.request.getCall(0);
      assert.lengthOf(call.args, 2);
      var config = call.args[0];
      assert.equal(config.method, 'POST');
      assert.equal(config.hostname, 'example.com');
    });

  });

  describe('put()', function() {

    it('calls request() with method set to PUT', function() {
      req.put({url: 'http://example.com'});
      assert.equal(http.request.callCount, 1);
      var call = http.request.getCall(0);
      assert.lengthOf(call.args, 2);
      var config = call.args[0];
      assert.equal(config.method, 'PUT');
      assert.equal(config.hostname, 'example.com');
    });

  });

  describe('del()', function() {

    it('calls request() with method set to DELETE', function() {
      req.del({url: 'http://example.com'});
      assert.equal(http.request.callCount, 1);
      var call = http.request.getCall(0);
      assert.lengthOf(call.args, 2);
      var config = call.args[0];
      assert.equal(config.method, 'DELETE');
      assert.equal(config.hostname, 'example.com');
    });

  });

  describe('parseConfig()', function() {
    // {api_key: 'my-api-key'}
    var token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhcGlfa2V5Ijoib' +
        'XktYXBpLWtleSJ9.sYcuJzdUThIsvJGNymbobOh-nY6ZKFEqXTqwZS-4QvE';
    var parseConfig = req.parseConfig;
    var defaultHeaders = {accept: 'application/json'};

    var existingLocation;
    beforeEach(function() {
      existingLocation = global.location;
    });
    afterEach(function() {
      global.location = existingLocation;
    });

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

    describe('relative urls', function() {
      var originalLocation = util.currentLocation;

      beforeEach(function() {
        util.currentLocation = function() {
          return {
            href: 'http://example.com/foo/bar.html'
          };
        };
      });

      afterEach(function() {
        util.currentLocation = originalLocation;
      });

      it('resolves a relative URL if location is defined', function() {
        var config = {
          url: './relative/path/to/data.json'
        };

        var options = {
          protocol: 'http:',
          hostname: 'example.com',
          port: '80',
          method: 'GET',
          path: '/foo/relative/path/to/data.json',
          headers: defaultHeaders
        };

        assert.deepEqual(parseConfig(config), options);
      });

      it('works for root relative URLs', function() {
        var config = {
          url: '/root/path/to/data.json'
        };

        var options = {
          protocol: 'http:',
          hostname: 'example.com',
          port: '80',
          method: 'GET',
          path: '/root/path/to/data.json',
          headers: defaultHeaders
        };

        assert.deepEqual(parseConfig(config), options);
      });

    });

    it('adds user provided headers', function() {
      var config = {
        url: 'http://example.com',
        headers: {
          foo: 'bar'
        }
      };
      var options = {
        protocol: 'http:',
        hostname: 'example.com',
        port: '80',
        method: 'GET',
        path: '/',
        headers: util.assign({}, defaultHeaders, config.headers)
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

    it('works with a url.parse() response', function() {
      var config = url.parse('https://example.com/page/1', true);
      config.query.foo = 'bar';

      var options = {
        protocol: 'https:',
        hostname: 'example.com',
        port: '443',
        method: 'GET',
        path: '/page/1?foo=bar',
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

    it('accepts a body that can be serialized to JSON', function() {
      var config = {
        url: 'http://example.com/page',
        method: 'POST',
        body: {
          foo: 'bar'
        }
      };

      var headers = assign({
        'content-type': 'application/json',
        'content-length': 13
      }, defaultHeaders);

      var options = {
        protocol: 'http:',
        hostname: 'example.com',
        port: '80',
        method: 'POST',
        path: '/page',
        headers: headers
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

    it('adds authorization header with stored token', function() {
      authStore.setToken(token);
      var config = {
        url: 'http://example.com/'
      };
      var options = parseConfig(config);

      var headers = options.headers;
      assert.equal(headers.authorization, 'Bearer ' + token);
    });

    it('adds authorization header with stored API key', function() {
      var key = 'my-key';
      authStore.setKey(key);
      var config = {
        url: 'http://example.com/'
      };
      var options = parseConfig(config);

      var headers = options.headers;
      assert.equal(headers.authorization, 'api-key ' + key);
    });

    it('prefers token to API key', function() {
      authStore.setToken(token);
      authStore.setKey('some-key');
      var config = {
        url: 'http://example.com/'
      };
      var options = parseConfig(config);

      var headers = options.headers;
      assert.equal(headers.authorization, 'Bearer ' + token);
    });

  });

});
