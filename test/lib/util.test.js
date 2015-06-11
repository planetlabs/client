/* eslint-env mocha */
var assert = require('chai').assert;

var auth = require('../../lib/auth');
var util = require('../../lib/util');

describe('util', function() {

  describe('augmentSceneLinks()', function() {
    afterEach(function() {
      auth.clear();
    });

    it('adds a stored API key to data URLs', function() {
      var key = 'my-key';
      auth.setKey(key);
      var scene = {
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
      };

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
