/* eslint-env mocha */
const assign = require('../../api/util').assign;
const authStore = require('../../api/auth-store');
const chai = require('chai');
const errors = require('../../api/errors');
const req = require('../../api/request');
const testUtil = require('../util');
const url = require('url');
const util = require('../../api/util');

chai.config.truncateThreshold = 0;
const assert = chai.assert;

describe('api/request', function () {
  describe('using a mock XMLHttpRequest', function () {
    let mock;

    beforeEach(function () {
      mock = testUtil.mockXHR();
    });

    afterEach(testUtil.restoreXHR);

    describe('request()', function () {
      const request = req.request;

      it('returns a promise', function () {
        const promise = request({url: 'https://example.com'});
        assert.instanceOf(promise, Promise);
      });

      it('creates an XHR instance and calls methods', function () {
        request({url: 'http://example.com'});

        assert.equal(mock.open.callCount, 1);
        assert.deepEqual(mock.open.getCall(0).args, [
          'GET',
          'http://example.com/',
        ]);

        assert.equal(mock.setRequestHeader.callCount, 1);
        assert.deepEqual(mock.setRequestHeader.getCall(0).args, [
          'accept',
          'application/json',
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

      it('resolves to an object with body and response', function (done) {
        const body = {foo: 'bar'};
        const loadEvent = {
          target: {
            status: 200,
            responseText: JSON.stringify(body),
          },
        };

        const promise = request({url: 'http://example.com'});
        promise
          .then(function (obj) {
            assert.equal(obj.response, loadEvent.target);
            assert.deepEqual(obj.body, body);
            done();
          })
          .catch(done);

        // mock the load event for the response
        assert.equal(mock.addEventListener.callCount, 2);
        const args = mock.addEventListener.getCall(0).args;
        assert.lengthOf(args, 2);
        assert.equal(args[0], 'load');
        const listener = args[1];
        listener(loadEvent);
      });

      it('posts a form as the body', function () {
        const form = {};
        request({
          method: 'POST',
          url: 'http://example.com',
          form: form,
        });

        assert.equal(mock.open.callCount, 1);
        assert.deepEqual(mock.open.getCall(0).args, [
          'POST',
          'http://example.com/',
        ]);

        assert.equal(mock.send.callCount, 1);
        assert.deepEqual(mock.send.getCall(0).args, [form]);
      });

      it('follows location header on 302', function (done) {
        const firstLoadEvent = {
          target: {
            status: 302,
            getResponseHeader: function (header) {
              if (header !== 'Location') {
                throw new Error('Unexpected getResponseHeader call: ' + header);
              }
              return 'https://redirect.com';
            },
          },
        };

        const body = {foo: 'bar'};
        const secondLoadEvent = {
          target: {
            status: 200,
            responseText: JSON.stringify(body),
          },
        };

        const promise = request({
          url: 'https://example.com',
        });
        promise
          .then(function (obj) {
            assert.equal(obj.response, secondLoadEvent.target);
            assert.deepEqual(obj.body, body);
            done();
          })
          .catch(done);

        // mock the first response load event (302)
        assert.equal(mock.addEventListener.callCount, 2);
        assert.equal(mock.addEventListener.getCall(0).args[0], 'load');
        const firstListener = mock.addEventListener.getCall(0).args[1];
        firstListener(firstLoadEvent);

        // mock the second response load event (200)
        assert.equal(mock.addEventListener.callCount, 4);
        assert.equal(mock.addEventListener.getCall(2).args[0], 'load');
        const secondCallback = mock.addEventListener.getCall(2).args[1];
        secondCallback(secondLoadEvent);
      });

      it('rejects for invalid JSON in successful response', function (done) {
        const body = 'garbage response body';
        const loadEvent = {
          target: {
            status: 200,
            responseText: body,
          },
        };

        const promise = request({url: 'http://example.com'});
        promise
          .then(
            function () {
              done(new Error('Expected promise to be rejected'));
            },
            function (err) {
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
        const args = mock.addEventListener.getCall(0).args;
        assert.equal(args[0], 'load');
        const listener = args[1];
        listener(loadEvent);
      });

      it('rejects with UnexpectedResponse for 500 response', function (done) {
        const body = 'server error (maybe a secret in the stack trace)';
        const loadEvent = {
          target: {
            status: 500,
            responseText: body,
          },
        };

        const promise = request({url: 'http://example.com', retries: 0});
        promise
          .then(
            function () {
              done(new Error('Expected promise to be rejected'));
            },
            function (err) {
              assert.instanceOf(err, errors.UnexpectedResponse);
              assert.include(err.message, 'Unexpected response status: 500');
              assert.equal(err.body, null); // don't leak unexpected responses
              done();
            }
          )
          .catch(done);

        // mock the response load event
        assert.equal(mock.addEventListener.callCount, 2);
        const args = mock.addEventListener.getCall(0).args;
        assert.equal(args[0], 'load');
        const listener = args[1];
        listener(loadEvent);
      });

      it('rejects with BadRequest for 400', function (done) {
        const body = {message: 'Invalid email or password', errors: []};
        const loadEvent = {
          target: {
            status: 400,
            responseText: JSON.stringify(body),
          },
        };

        const promise = request({url: 'http://example.com'});
        promise
          .then(
            function () {
              done(new Error('Expected promise to be rejected'));
            },
            function (err) {
              assert.instanceOf(err, errors.BadRequest);
              assert.include(err.message, 'Bad request');
              assert.deepEqual(err.body, body);
              done();
            }
          )
          .catch(done);

        // mock the response load event
        assert.equal(mock.addEventListener.callCount, 2);
        const args = mock.addEventListener.getCall(0).args;
        assert.equal(args[0], 'load');
        const listener = args[1];
        listener(loadEvent);
      });

      it('rejects with Unauthorized for 401', function (done) {
        const body = {message: 'Invalid email or password', errors: []};
        const loadEvent = {
          target: {
            status: 401,
            responseText: JSON.stringify(body),
          },
        };

        const promise = request({url: 'http://example.com'});
        promise
          .then(
            function () {
              done(new Error('Expected promise to be rejected'));
            },
            function (err) {
              assert.instanceOf(err, errors.Unauthorized);
              assert.include(err.message, 'Unauthorized');
              assert.deepEqual(err.body, body);
              done();
            }
          )
          .catch(done);

        // mock the response load event
        assert.equal(mock.addEventListener.callCount, 2);
        const args = mock.addEventListener.getCall(0).args;
        assert.equal(args[0], 'load');
        const listener = args[1];
        listener(loadEvent);
      });

      it('rejects with Forbidden for 403', function (done) {
        const body = {message: 'some user info here'};
        const loadEvent = {
          target: {
            status: 403,
            responseText: JSON.stringify(body),
          },
        };

        const promise = request({url: 'http://example.com'});
        promise
          .then(
            function () {
              done(new Error('Expected promise to be rejected'));
            },
            function (err) {
              assert.instanceOf(err, errors.Forbidden);
              assert.include(err.message, 'Forbidden');
              assert.deepEqual(err.body, body);
              done();
            }
          )
          .catch(done);

        // mock the response load event
        assert.equal(mock.addEventListener.callCount, 2);
        const args = mock.addEventListener.getCall(0).args;
        assert.equal(args[0], 'load');
        const listener = args[1];
        listener(loadEvent);
      });

      it('accepts a terminator for aborting requests', function (done) {
        const promise = request({
          url: 'http//example.com',
          terminator: function (abort) {
            setTimeout(abort, 10);
          },
        });
        setTimeout(function () {
          done();
        }, 200);
        promise
          .then(function () {
            done(new Error('Expected promise not to be resolved'));
          })
          .catch(function () {
            done(new Error('Expected promise not to be rejected'));
          });
      });
    });

    describe('get()', function () {
      it('calls request() with method set to GET', function () {
        req.get({url: 'http://example.com'});
        assert.equal(mock.open.callCount, 1);
        assert.deepEqual(mock.open.getCall(0).args, [
          'GET',
          'http://example.com/',
        ]);
      });

      it('accepts a string for the URL', function () {
        req.get('http://example.com');
        assert.equal(mock.open.callCount, 1);
        assert.deepEqual(mock.open.getCall(0).args, [
          'GET',
          'http://example.com/',
        ]);
      });
    });

    describe('post()', function () {
      it('calls request() with method set to POST', function () {
        req.post({url: 'http://example.com'});
        assert.equal(mock.open.callCount, 1);
        assert.deepEqual(mock.open.getCall(0).args, [
          'POST',
          'http://example.com/',
        ]);
      });
    });

    describe('put()', function () {
      it('calls request() with method set to PUT', function () {
        req.put({url: 'http://example.com'});
        assert.equal(mock.open.callCount, 1);
        assert.deepEqual(mock.open.getCall(0).args, [
          'PUT',
          'http://example.com/',
        ]);
      });
    });

    describe('del()', function () {
      it('calls request() with method set to DELETE', function () {
        req.del({url: 'http://example.com'});
        assert.equal(mock.open.callCount, 1);
        assert.deepEqual(mock.open.getCall(0).args, [
          'DELETE',
          'http://example.com/',
        ]);
      });
    });
  });

  describe('using the XMLHttpRequest polyfill', function () {
    beforeEach(testUtil.polyfillXHR);
    afterEach(testUtil.restoreXHR);

    describe('request()', function () {
      const request = req.request;

      it('rejects with ClientError when there is a client error', function (done) {
        const promise = request({url: 'xyz:pdq'});

        promise
          .then(
            function () {
              done(new Error('Expected promise to be rejected'));
            },
            function (err) {
              assert.instanceOf(err, errors.ClientError, err.stack);
              assert.include(err.message, 'Request failed');
              done();
            }
          )
          .catch(done);
      });
    });

    describe('parseConfig()', function () {
      // {api_key: 'my-api-key'}
      const token =
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhcGlfa2V5Ijoib' +
        'XktYXBpLWtleSJ9.sYcuJzdUThIsvJGNymbobOh-nY6ZKFEqXTqwZS-4QvE';
      const parseConfig = req.parseConfig;
      const defaultHeaders = {accept: 'application/json'};

      afterEach(function () {
        authStore.clear();
      });

      it('generates request options from a URL', function () {
        const config = {
          url: 'http://example.com',
        };
        const options = {
          method: 'GET',
          url: 'http://example.com/',
          headers: defaultHeaders,
        };

        assert.deepEqual(parseConfig(config), options);
      });

      it('adds user provided headers', function () {
        const config = {
          url: 'http://example.com',
          headers: {
            foo: 'bar',
          },
        };
        const options = {
          method: 'GET',
          url: 'http://example.com/',
          headers: util.assign({}, defaultHeaders, config.headers),
        };

        assert.deepEqual(parseConfig(config), options);
      });

      it('works with a url.parse() response', function () {
        const config = url.parse('https://example.com/page/1', true);
        config.query.foo = 'bar';

        const options = {
          method: 'GET',
          url: 'https://example.com/page/1?foo=bar',
          headers: defaultHeaders,
        };

        assert.deepEqual(parseConfig(config), options);
      });

      it('respects the port in the URL', function () {
        const config = {
          url: 'http://example.com:8000',
        };
        const options = {
          method: 'GET',
          url: 'http://example.com:8000/',
          headers: defaultHeaders,
        };

        assert.deepEqual(parseConfig(config), options);
      });

      it('accepts a body that can be serialized to JSON', function () {
        const config = {
          url: 'http://example.com/page',
          method: 'POST',
          body: {
            foo: 'bar',
          },
        };

        const headers = assign(
          {
            'content-type': 'application/json',
          },
          defaultHeaders
        );

        const options = {
          method: 'POST',
          url: 'http://example.com/page',
          headers: headers,
        };

        assert.deepEqual(parseConfig(config), options);
      });

      it('accepts a form for the body', function () {
        const form = {};
        const config = {
          url: 'http://example.com/page',
          method: 'POST',
          form: form,
        };

        const options = {
          method: 'POST',
          url: 'http://example.com/page',
          headers: assign({}, defaultHeaders),
        };

        assert.deepEqual(parseConfig(config), options);
      });

      it('respects a query string in the URL', function () {
        const config = {
          url: 'http://example.com/page?foo=bar',
        };
        const options = {
          method: 'GET',
          url: 'http://example.com/page?foo=bar',
          headers: defaultHeaders,
        };

        assert.deepEqual(parseConfig(config), options);
      });

      it('accepts a config with url and query', function () {
        const config = {
          url: 'http://example.com/page',
          query: {
            foo: 'bar bam',
          },
        };
        const options = {
          method: 'GET',
          url: 'http://example.com/page?foo=bar%20bam',
          headers: defaultHeaders,
        };

        assert.deepEqual(parseConfig(config), options);
      });

      it('extends an existing URL query string with query object', function () {
        const config = {
          url: 'http://example.com/page?foo=bar',
          query: {
            bam: 'baz',
          },
        };
        const options = {
          method: 'GET',
          url: 'http://example.com/page?foo=bar&bam=baz',
          headers: defaultHeaders,
        };

        assert.deepEqual(parseConfig(config), options);
      });

      it('allows query object to override query string', function () {
        const config = {
          url: 'http://example.com/?foo=bar',
          query: {
            foo: 'bam',
          },
        };
        const options = {
          method: 'GET',
          url: 'http://example.com/?foo=bam',
          headers: defaultHeaders,
        };

        assert.deepEqual(parseConfig(config), options);
      });

      it('passes along the withCredentials option', function () {
        const config = {
          url: 'http://example.com/',
          withCredentials: false,
        };
        const options = {
          method: 'GET',
          url: 'http://example.com/',
          headers: defaultHeaders,
          withCredentials: false,
        };

        assert.deepEqual(parseConfig(config), options);
      });

      it('adds authorization header with stored token', function () {
        authStore.setToken(token);
        const config = {
          url: 'http://example.com/',
        };
        const options = parseConfig(config);

        const headers = options.headers;
        assert.equal(headers.authorization, 'Bearer ' + token);
      });

      it('adds authorization header with stored API key', function () {
        const key = 'my-key';
        authStore.setKey(key);
        const config = {
          url: 'http://example.com/',
        };
        const options = parseConfig(config);

        const headers = options.headers;
        assert.equal(headers.authorization, 'api-key ' + key);
      });

      it('prefers token to API key', function () {
        authStore.setToken(token);
        authStore.setKey('some-key');
        const config = {
          url: 'http://example.com/',
        };
        const options = parseConfig(config);

        const headers = options.headers;
        assert.equal(headers.authorization, 'Bearer ' + token);
      });
    });
  });
});
