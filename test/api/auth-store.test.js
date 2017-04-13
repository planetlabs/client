/* eslint-env mocha */
var assert = require('chai').assert;

var authStore = require('../../api/auth-store');

describe('api/auth-store', function() {
  afterEach(function() {
    authStore.clear();
  });

  describe('setToken()', function() {
    // {api_key: 'my-api-key'}
    var token =
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhcGlfa2V5Ijoib' +
      'XktYXBpLWtleSJ9.sYcuJzdUThIsvJGNymbobOh-nY6ZKFEqXTqwZS-4QvE';

    it('stores a token', function() {
      authStore.setToken(token);
      assert.deepEqual(authStore.getToken(), token);
    });

    it('stores API key in the token', function() {
      authStore.setToken(token);
      assert.equal(authStore.getKey(), 'my-api-key');
    });

    it('throws if the token does not contain an api_key claim', function() {
      // {foo: 'bar'}
      var bogus =
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmb28iOiJiYXIifQ.' +
        'yPmf5QFV26W-3ldVCrsvRdnecy7QjA0fnCWCDLDZ-M4';

      function call() {
        authStore.setToken(bogus);
      }
      assert.throws(call, Error, 'Expected api_key in token payload');
    });
  });

  describe('getToken()', function() {
    it('returns undefined for no stored token', function() {
      assert.isUndefined(authStore.getToken());
    });
  });

  describe('setKey()', function() {
    it('stores an API key', function() {
      var key = 'my-api-key';
      authStore.setKey(key);
      assert.equal(authStore.getKey(), key);
    });
  });

  describe('getKey()', function() {
    it('returns undefined for no stored key', function() {
      assert.isUndefined(authStore.getKey());
    });

    it('gets a stored API key', function() {
      var key = 'my-api-key';
      authStore.setKey(key);
      assert.equal(authStore.getKey(), key);
    });
  });

  describe('clear()', function() {
    it('clears any previously stored API key', function() {
      authStore.setKey('some-key');
      authStore.clear();
      assert.isUndefined(authStore.getKey());
    });
  });
});
