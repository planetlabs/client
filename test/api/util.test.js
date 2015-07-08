/* eslint-env mocha */
var assert = require('chai').assert;

var authStore = require('../../api/auth-store');
var util = require('../../api/util');

describe('util', function() {

  describe('augmentSceneLinks()', function() {
    var scene;

    beforeEach(function() {
      scene = util.assign({}, {
        properties: {
          links: {
            'full': 'http://example.com/#hash',
            'square_thumbnail': 'http://example.com/?foo=bar',
            'thumbnail': 'http://example.com/thumb'
          },
          data: {
            products: {
              foo: {
                bar: 'http://example.com/foo/bar'
              }
            }
          }
        }
      });
    });

    afterEach(function() {
      authStore.clear();
    });

    it('adds a API key from stored token to data URLs', function() {
      // {api_key: 'my-api-key'}
      var token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhcGlfa2V5Ijoib' +
          'XktYXBpLWtleSJ9.sYcuJzdUThIsvJGNymbobOh-nY6ZKFEqXTqwZS-4QvE';
      authStore.setToken(token);
      var key = authStore.getKey();

      var augmented = util.augmentSceneLinks(scene);
      assert.equal(augmented.properties.links.full,
          'http://example.com/?api_key=' + key + '#hash');
      assert.equal(augmented.properties.links['square_thumbnail'],
          'http://example.com/?foo=bar&api_key=' + key);
      assert.equal(augmented.properties.links.thumbnail,
          'http://example.com/thumb?api_key=' + key);
      assert.equal(augmented.properties.data.products.foo.bar,
          'http://example.com/foo/bar?api_key=' + key);
    });

    it('adds a stored API key to data URLs', function() {
      var key = 'my-key';
      authStore.setKey(key);

      var augmented = util.augmentSceneLinks(scene);
      assert.equal(augmented.properties.links.full,
          'http://example.com/?api_key=' + key + '#hash');
      assert.equal(augmented.properties.links['square_thumbnail'],
          'http://example.com/?foo=bar&api_key=' + key);
      assert.equal(augmented.properties.links.thumbnail,
          'http://example.com/thumb?api_key=' + key);
      assert.equal(augmented.properties.data.products.foo.bar,
          'http://example.com/foo/bar?api_key=' + key);
    });

  });

});
