/* eslint-env mocha */

const assert = require('chai').assert;
const auth = require('../../api/auth');
const errors = require('../../api/errors');
const testUtil = require('../util');

describe('api/auth', function () {
  // {api_key: 'my-api-key'}
  const token =
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhcGlfa2V5Ijoib' +
    'XktYXBpLWtleSJ9.sYcuJzdUThIsvJGNymbobOh-nY6ZKFEqXTqwZS-4QvE';

  let mock;
  beforeEach(function () {
    mock = testUtil.mockXHR();
  });

  afterEach(function () {
    testUtil.restoreXHR();
    auth.logout();
  });

  describe('login()', function () {
    it('posts credentials to login endpoint', function () {
      const email = 'user@email.com';
      const password = 'psswd';
      auth.login(email, password);

      assert.equal(mock.open.callCount, 1);
      assert.equal(mock.open.getCall(0).args[0], 'POST');

      assert.equal(mock.send.callCount, 1);
      const body = mock.send.getCall(0).args[0];
      assert.deepEqual(JSON.parse(body), {email: email, password: password});
    });

    it('expects a JWT token member in the response body', function (done) {
      const body = {token: token};
      const loadEvent = {
        target: {
          status: 200,
          responseText: JSON.stringify(body),
        },
      };

      const email = 'user@email.com';
      const password = 'psswd';
      auth
        .login(email, password)
        .then(function (success) {
          assert.equal(success, token);
          assert.equal(auth.getToken(), token);
          assert.equal(auth.getKey(), 'my-api-key');
          done();
        })
        .catch(done);

      // mock the load event for the response
      assert.equal(mock.addEventListener.callCount, 2);
      const args = mock.addEventListener.getCall(0).args;
      assert.equal(args[0], 'load');
      const listener = args[1];
      listener(loadEvent);
    });

    it('rejects if body does not contain a token', function (done) {
      const body = {foo: 'bar'};
      const loadEvent = {
        target: {
          status: 200,
          responseText: JSON.stringify(body),
        },
      };

      const email = 'user@email.com';
      const password = 'psswd';
      auth
        .login(email, password)
        .then(
          function () {
            done(new Error('Expected rejection'));
          },
          function (err) {
            assert.instanceOf(err, errors.UnexpectedResponse);
            done();
          }
        )
        .catch(done);

      // mock the load event for the response
      assert.equal(mock.addEventListener.callCount, 2);
      const args = mock.addEventListener.getCall(0).args;
      assert.equal(args[0], 'load');
      const listener = args[1];
      listener(loadEvent);
    });

    it('rejects if body contains a bogus token', function (done) {
      const body = {token: 'bogus'};
      const loadEvent = {
        target: {
          status: 200,
          responseText: JSON.stringify(body),
        },
      };

      const email = 'user@email.com';
      const password = 'psswd';
      auth
        .login(email, password)
        .then(
          function () {
            done(new Error('Expected rejection'));
          },
          function (err) {
            assert.instanceOf(err, errors.UnexpectedResponse);
            done();
          }
        )
        .catch(done);

      // mock the load event for the response
      assert.equal(mock.addEventListener.callCount, 2);
      const args = mock.addEventListener.getCall(0).args;
      assert.equal(args[0], 'load');
      const listener = args[1];
      listener(loadEvent);
    });
  });

  describe('setKey()', function () {
    it('stores an API key', function () {
      const key = 'my-api-key';
      auth.setKey(key);
      assert.equal(auth.getKey(), key);
    });
  });

  describe('getKey()', function () {
    it('gets any stored API key', function () {
      const key = 'my-api-key';
      auth.setKey(key);
      assert.equal(auth.getKey(), key);
    });
  });

  describe('logout()', function () {
    it('clears any previously stored token', function () {
      auth.setToken(token);
      auth.logout();
      assert.isUndefined(auth.getToken());
      assert.isUndefined(auth.getKey());
    });

    it('clears any previously stored API key', function () {
      auth.setKey('some-key');
      auth.logout();
      assert.isUndefined(auth.getKey());
    });
  });
});
