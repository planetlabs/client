/* eslint-env mocha */
var assign = require('../../api/util').assign;
var authStore = require('../../api/auth-store');
var chai = require('chai');
var errors = require('../../api/errors');
var req = require('../../api/request');
var testUtil = require('../util');
var url = require('url');
var util = require('../../api/util');

chai.config.truncateThreshold = 0;
var assert = chai.assert;

describe('api/request', function() {
  describe('using a mock XMLHttpRequest', function() {
    var mock;

    beforeEach(function() {
      mock = testUtil.mockXHR();
    });

    afterEach(testUtil.unmockXHR);

    describe('request()', function() {
      var request = req.request;

      it('returns a promise', function() {
        var promise = request({url: 'https://example.com'});
        assert.instanceOf(promise, Promise);
      });

      it('creates an XHR instance and calls methods', function() {
        request({url: 'http://example.com'});

        assert.equal(mock.open.callCount, 1);
        assert.deepEqual(mock.open.getCall(0).args, [
          'GET',
          'http://example.com/'
        ]);

        assert.equal(mock.setRequestHeader.callCount, 1);
        assert.deepEqual(mock.setRequestHeader.getCall(0).args, [
          'accept',
          'application/json'
        ]);

        assert.equal(mock.addEventListener.callCount, 2);

        assert.equal(mock.addEventListener.getCall(0).args[0], 'load');
        assert.equal(
          typeof mock.addEventListener.getCall(0).args[1],
          'function'
        );

        assert.equal(mock.addEventListener.getCall(1).args[0], 'error');
        assert.equal(
          typeof mock.addEventListener.getCall(1).args[1],
          'function'
        );
      });

      it('resolves to an object with body and response', function(done) {
        var body = {foo: 'bar'};
        var loadEvent = {
          target: {
            status: 200,
            responseText: JSON.stringify(body)
          }
        };

        var promise = request({url: 'http://example.com'});
        promise
          .then(function(obj) {
            assert.equal(obj.response, loadEvent.target);
            assert.deepEqual(obj.body, body);
            done();
          })
          .catch(done);

        // mock the load event for the response
        assert.equal(mock.addEventListener.callCount, 2);
        var args = mock.addEventListener.getCall(0).args;
        assert.lengthOf(args, 2);
        assert.equal(args[0], 'load');
        var listener = args[1];
        listener(loadEvent);
      });

      it('posts a form as the body', function() {
        var form = {};
        request({
          method: 'POST',
          url: 'http://example.com',
          form: form
        });

        assert.equal(mock.open.callCount, 1);
        assert.deepEqual(mock.open.getCall(0).args, [
          'POST',
          'http://example.com/'
        ]);

        assert.equal(mock.send.callCount, 1);
        assert.deepEqual(mock.send.getCall(0).args, [form]);
      });

      it('follows location header on 302', function(done) {
        var firstLoadEvent = {
          target: {
            status: 302,
            getResponseHeader: function(header) {
              if (header !== 'Location') {
                throw new Error('Unexpected getResponseHeader call: ' + header);
              }
              return 'https://redirect.com';
            }
          }
        };

        var body = {foo: 'bar'};
        var secondLoadEvent = {
          target: {
            status: 200,
            responseText: JSON.stringify(body)
          }
        };

        var promise = request({
          url: 'https://example.com'
        });
        promise
          .then(function(obj) {
            assert.equal(obj.response, secondLoadEvent.target);
            assert.deepEqual(obj.body, body);
            done();
          })
          .catch(done);

        // mock the first response load event (302)
        assert.equal(mock.addEventListener.callCount, 2);
        assert.equal(mock.addEventListener.getCall(0).args[0], 'load');
        var firstListener = mock.addEventListener.getCall(0).args[1];
        firstListener(firstLoadEvent);

        // mock the second response load event (200)
        assert.equal(mock.addEventListener.callCount, 4);
        assert.equal(mock.addEventListener.getCall(2).args[0], 'load');
        var secondCallback = mock.addEventListener.getCall(2).args[1];
        secondCallback(secondLoadEvent);
      });

      it('rejects for invalid JSON in successful response', function(done) {
        var body = 'garbage response body';
        var loadEvent = {
          target: {
            status: 200,
            responseText: body
          }
        };

        var promise = request({url: 'http://example.com'});
        promise
          .then(
            function() {
              done(new Error('Expected promise to be rejected'));
            },
            function(err) {
              assert.instanceOf(err, errors.UnexpectedResponse);
              assert.include(
                err.message,
                'Trouble parsing response body as JSON'
              );
              assert.equal(err.body, body);
              done();
            }
          )
          .catch(done);

        // mock the response load event
        assert.equal(mock.addEventListener.callCount, 2);
        var args = mock.addEventListener.getCall(0).args;
        assert.equal(args[0], 'load');
        var listener = args[1];
        listener(loadEvent);
      });

      it('rejects with UnexpectedResponse for 500 response', function(done) {
        var body = 'server error (maybe a secret in the stack trace)';
        var loadEvent = {
          target: {
            status: 500,
            responseText: body
          }
        };

        var promise = request({url: 'http://example.com', retries: 0});
        promise
          .then(
            function() {
              done(new Error('Expected promise to be rejected'));
            },
            function(err) {
              assert.instanceOf(err, errors.UnexpectedResponse);
              assert.include(err.message, 'Unexpected response status: 500');
              assert.equal(err.body, null); // don't leak unexpected responses
              done();
            }
          )
          .catch(done);

        // mock the response load event
        assert.equal(mock.addEventListener.callCount, 2);
        var args = mock.addEventListener.getCall(0).args;
        assert.equal(args[0], 'load');
        var listener = args[1];
        listener(loadEvent);
      });

      it('rejects with BadRequest for 400', function(done) {
        var body = {message: 'Invalid email or password', errors: []};
        var loadEvent = {
          target: {
            status: 400,
            responseText: JSON.stringify(body)
          }
        };

        var promise = request({url: 'http://example.com'});
        promise
          .then(
            function() {
              done(new Error('Expected promise to be rejected'));
            },
            function(err) {
              assert.instanceOf(err, errors.BadRequest);
              assert.include(err.message, 'Bad request');
              assert.deepEqual(err.body, body);
              done();
            }
          )
          .catch(done);

        // mock the response load event
        assert.equal(mock.addEventListener.callCount, 2);
        var args = mock.addEventListener.getCall(0).args;
        assert.equal(args[0], 'load');
        var listener = args[1];
        listener(loadEvent);
      });

      it('rejects with Unauthorized for 401', function(done) {
        var body = {message: 'Invalid email or password', errors: []};
        var loadEvent = {
          target: {
            status: 401,
            responseText: JSON.stringify(body)
          }
        };

        var promise = request({url: 'http://example.com'});
        promise
          .then(
            function() {
              done(new Error('Expected promise to be rejected'));
            },
            function(err) {
              assert.instanceOf(err, errors.Unauthorized);
              assert.include(err.message, 'Unauthorized');
              assert.deepEqual(err.body, body);
              done();
            }
          )
          .catch(done);

        // mock the response load event
        assert.equal(mock.addEventListener.callCount, 2);
        var args = mock.addEventListener.getCall(0).args;
        assert.equal(args[0], 'load');
        var listener = args[1];
        listener(loadEvent);
      });

      it('rejects with Forbidden for 403', function(done) {
        var body = {message: 'some user info here'};
        var loadEvent = {
          target: {
            status: 403,
            responseText: JSON.stringify(body)
          }
        };

        var promise = request({url: 'http://example.com'});
        promise
          .then(
            function() {
              done(new Error('Expected promise to be rejected'));
            },
            function(err) {
              assert.instanceOf(err, errors.Forbidden);
              assert.include(err.message, 'Forbidden');
              assert.deepEqual(err.body, body);
              done();
            }
          )
          .catch(done);

        // mock the response load event
        assert.equal(mock.addEventListener.callCount, 2);
        var args = mock.addEventListener.getCall(0).args;
        assert.equal(args[0], 'load');
        var listener = args[1];
        listener(loadEvent);
      });

      it('accepts a terminator for aborting requests', function(done) {
        var promise = request({
          url: 'http//example.com',
          terminator: function(abort) {
            setTimeout(abort, 10);
          }
        });
        setTimeout(function() {
          done();
        }, 200);
        promise
          .then(function() {
            done(new Error('Expected promise not to be resolved'));
          })
          .catch(function() {
            done(new Error('Expected promise not to be rejected'));
          });
      });
    });

    describe('get()', function() {
      it('calls request() with method set to GET', function() {
        req.get({url: 'http://example.com'});
        assert.equal(mock.open.callCount, 1);
        assert.deepEqual(mock.open.getCall(0).args, [
          'GET',
          'http://example.com/'
        ]);
      });

      it('accepts a string for the URL', function() {
        req.get('http://example.com');
        assert.equal(mock.open.callCount, 1);
        assert.deepEqual(mock.open.getCall(0).args, [
          'GET',
          'http://example.com/'
        ]);
      });
    });

    describe('post()', function() {
      it('calls request() with method set to POST', function() {
        req.post({url: 'http://example.com'});
        assert.equal(mock.open.callCount, 1);
        assert.deepEqual(mock.open.getCall(0).args, [
          'POST',
          'http://example.com/'
        ]);
      });
    });

    describe('put()', function() {
      it('calls request() with method set to PUT', function() {
        req.put({url: 'http://example.com'});
        assert.equal(mock.open.callCount, 1);
        assert.deepEqual(mock.open.getCall(0).args, [
          'PUT',
          'http://example.com/'
        ]);
      });
    });

    describe('del()', function() {
      it('calls request() with method set to DELETE', function() {
        req.del({url: 'http://example.com'});
        assert.equal(mock.open.callCount, 1);
        assert.deepEqual(mock.open.getCall(0).args, [
          'DELETE',
          'http://example.com/'
        ]);
      });
    });
  });

  describe('using the real XMLHttpRequest', function() {
    describe('request()', function() {
      var request = req.request;

      it('rejects with ClientError when there is a client error', function(done) {
        var promise = request({url: 'xyz:pdq'});

        promise
          .then(
            function() {
              done(new Error('Expected promise to be rejected'));
            },
            function(err) {
              assert.instanceOf(err, errors.ClientError, err.stack);
              assert.include(err.message, 'Request failed');
              done();
            }
          )
          .catch(done);
      });
    });

    describe('parseConfig()', function() {
      // {api_key: 'my-api-key'}
      var token =
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhcGlfa2V5Ijoib' +
        'XktYXBpLWtleSJ9.sYcuJzdUThIsvJGNymbobOh-nY6ZKFEqXTqwZS-4QvE';
      var parseConfig = req.parseConfig;
      var defaultHeaders = {accept: 'application/json'};

      afterEach(function() {
        authStore.clear();
      });

      it('generates request options from a URL', function() {
        var config = {
          url: 'http://example.com'
        };
        var options = {
          method: 'GET',
          url: 'http://example.com/',
          headers: defaultHeaders
        };

        assert.deepEqual(parseConfig(config), options);
      });

      it('adds user provided headers', function() {
        var config = {
          url: 'http://example.com',
          headers: {
            foo: 'bar'
          }
        };
        var options = {
          method: 'GET',
          url: 'http://example.com/',
          headers: util.assign({}, defaultHeaders, config.headers)
        };

        assert.deepEqual(parseConfig(config), options);
      });

      it('works with a url.parse() response', function() {
        var config = url.parse('https://example.com/page/1', true);
        config.query.foo = 'bar';

        var options = {
          method: 'GET',
          url: 'https://example.com/page/1?foo=bar',
          headers: defaultHeaders
        };

        assert.deepEqual(parseConfig(config), options);
      });

      it('respects the port in the URL', function() {
        var config = {
          url: 'http://example.com:8000'
        };
        var options = {
          method: 'GET',
          url: 'http://example.com:8000/',
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

        var headers = assign(
          {
            'content-type': 'application/json'
          },
          defaultHeaders
        );

        var options = {
          method: 'POST',
          url: 'http://example.com/page',
          headers: headers
        };

        assert.deepEqual(parseConfig(config), options);
      });

      it('accepts a form for the body', function() {
        var form = {};
        var config = {
          url: 'http://example.com/page',
          method: 'POST',
          form: form
        };

        var options = {
          method: 'POST',
          url: 'http://example.com/page',
          headers: assign({}, defaultHeaders)
        };

        assert.deepEqual(parseConfig(config), options);
      });

      it('respects a query string in the URL', function() {
        var config = {
          url: 'http://example.com/page?foo=bar'
        };
        var options = {
          method: 'GET',
          url: 'http://example.com/page?foo=bar',
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
          method: 'GET',
          url: 'http://example.com/page?foo=bar%20bam',
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
          method: 'GET',
          url: 'http://example.com/page?foo=bar&bam=baz',
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
          method: 'GET',
          url: 'http://example.com/?foo=bam',
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
          method: 'GET',
          url: 'http://example.com/',
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
});
