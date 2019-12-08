/* eslint-env jest */

var auth = require('../../api/auth');
var errors = require('../../api/errors');
var testUtil = require('../util');

describe('api/auth', function() {
  // {api_key: 'my-api-key'}
  var token =
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhcGlfa2V5Ijoib' +
    'XktYXBpLWtleSJ9.sYcuJzdUThIsvJGNymbobOh-nY6ZKFEqXTqwZS-4QvE';

  var mock;
  beforeEach(function() {
    mock = testUtil.mockXHR();
  });

  afterEach(function() {
    testUtil.unmockXHR();
    auth.logout();
  });

  describe('login()', function() {
    it('posts credentials to login endpoint', function() {
      var email = 'user@email.com';
      var password = 'psswd';
      auth.login(email, password);

      expect(mock.open.callCount).toEqual(1);
      expect(mock.open.getCall(0).args[0]).toEqual('POST');

      expect(mock.send.callCount).toEqual(1);
      var body = mock.send.getCall(0).args[0];
      expect(JSON.parse(body)).toEqual({email: email, password: password});
    });

    it('expects a JWT token member in the response body', function(done) {
      var body = {token: token};
      var loadEvent = {
        target: {
          status: 200,
          responseText: JSON.stringify(body)
        }
      };

      var email = 'user@email.com';
      var password = 'psswd';
      auth
        .login(email, password)
        .then(function(success) {
          expect(success).toEqual(token);
          expect(auth.getToken()).toEqual(token);
          expect(auth.getKey()).toEqual('my-api-key');
          done();
        })
        .catch(done);

      // mock the load event for the response
      expect(mock.addEventListener.callCount).toEqual(2);
      var args = mock.addEventListener.getCall(0).args;
      expect(args[0]).toEqual('load');
      var listener = args[1];
      listener(loadEvent);
    });

    it('rejects if body does not contain a token', function(done) {
      var body = {foo: 'bar'};
      var loadEvent = {
        target: {
          status: 200,
          responseText: JSON.stringify(body)
        }
      };

      var email = 'user@email.com';
      var password = 'psswd';
      auth
        .login(email, password)
        .then(
          function() {
            done(new Error('Expected rejection'));
          },
          function(err) {
            expect(err).toBeInstanceOf(errors.UnexpectedResponse);
            done();
          }
        )
        .catch(done);

      // mock the load event for the response
      expect(mock.addEventListener.callCount).toEqual(2);
      var args = mock.addEventListener.getCall(0).args;
      expect(args[0]).toEqual('load');
      var listener = args[1];
      listener(loadEvent);
    });

    it('rejects if body contains a bogus token', function(done) {
      var body = {token: 'bogus'};
      var loadEvent = {
        target: {
          status: 200,
          responseText: JSON.stringify(body)
        }
      };

      var email = 'user@email.com';
      var password = 'psswd';
      auth
        .login(email, password)
        .then(
          function() {
            done(new Error('Expected rejection'));
          },
          function(err) {
            expect(err).toBeInstanceOf(errors.UnexpectedResponse);
            done();
          }
        )
        .catch(done);

      // mock the load event for the response
      expect(mock.addEventListener.callCount).toEqual(2);
      var args = mock.addEventListener.getCall(0).args;
      expect(args[0]).toEqual('load');
      var listener = args[1];
      listener(loadEvent);
    });
  });

  describe('setKey()', function() {
    it('stores an API key', function() {
      var key = 'my-api-key';
      auth.setKey(key);
      expect(auth.getKey()).toEqual(key);
    });
  });

  describe('getKey()', function() {
    it('gets any stored API key', function() {
      var key = 'my-api-key';
      auth.setKey(key);
      expect(auth.getKey()).toEqual(key);
    });
  });

  describe('logout()', function() {
    it('clears any previously stored token', function() {
      auth.setToken(token);
      auth.logout();
      expect(auth.getToken()).not.toBeDefined();
      expect(auth.getKey()).not.toBeDefined();
    });

    it('clears any previously stored API key', function() {
      auth.setKey('some-key');
      auth.logout();
      expect(auth.getKey()).not.toBeDefined();
    });
  });
});
