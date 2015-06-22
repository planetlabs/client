/* eslint-env mocha */
var assert = require('chai').assert;

var auth = require('../../../lib/api/auth');

describe('auth', function() {
  afterEach(function() {
    auth.clear();
  });

  describe('setKey()', function() {
    it('stores an API key', function() {
      var key = 'my-api-key';
      auth.setKey(key);
      assert.equal(auth.getKey(), key);
    });
  });

  describe('getKey()', function() {
    it('gets a stored API key', function() {
      assert.isUndefined(auth.getKey());
    });

    it('returns undefined for no stored key', function() {
      var key = 'my-api-key';
      auth.setKey(key);
      assert.equal(auth.getKey(), key);
    });
  });

  describe('clear()', function() {
    it('clears any previously stored API key', function() {
      auth.setKey('some-key');
      auth.clear();
      assert.isUndefined(auth.getKey());
    });
  });

});
