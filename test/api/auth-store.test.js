/* eslint-env jest */

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
      expect(authStore.getToken()).toEqual(token);
    });

    it('stores API key in the token', function() {
      authStore.setToken(token);
      expect(authStore.getKey()).toEqual('my-api-key');
    });

    it('throws if the token does not contain an api_key claim', function() {
      // {foo: 'bar'}
      var bogus =
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmb28iOiJiYXIifQ.' +
        'yPmf5QFV26W-3ldVCrsvRdnecy7QjA0fnCWCDLDZ-M4';

      function call() {
        authStore.setToken(bogus);
      }
      expect(call).toThrow();
    });
  });

  describe('getToken()', function() {
    it('returns undefined for no stored token', function() {
      expect(authStore.getToken()).not.toBeDefined();
    });
  });

  describe('setKey()', function() {
    it('stores an API key', function() {
      var key = 'my-api-key';
      authStore.setKey(key);
      expect(authStore.getKey()).toEqual(key);
    });
  });

  describe('getKey()', function() {
    it('returns undefined for no stored key', function() {
      expect(authStore.getKey()).not.toBeDefined();
    });

    it('gets a stored API key', function() {
      var key = 'my-api-key';
      authStore.setKey(key);
      expect(authStore.getKey()).toEqual(key);
    });
  });

  describe('clear()', function() {
    it('clears any previously stored API key', function() {
      authStore.setKey('some-key');
      authStore.clear();
      expect(authStore.getKey()).not.toBeDefined();
    });
  });
});
