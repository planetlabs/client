/* eslint-env mocha */
var assert = require('chai').assert;

var authStore = require('../../api/auth-store');
var util = require('../../api/util');

describe('util', function() {

  describe('addQueryParams()', function() {

    it('adds params from a query object', function() {

      var cases = [{
        url: 'http://example.com/',
        query: {
          foo: 'bar'
        },
        expect: 'http://example.com/?foo=bar'
      }, {
        url: 'http://example.com/?foo=bam',
        query: {
          baz: 'bar'
        },
        expect: 'http://example.com/?foo=bam&baz=bar'
      }, {
        url: 'http://example.com/?foo=bam',
        query: {
          foo: 'bar'
        },
        expect: 'http://example.com/?foo=bar'
      }, {
        url: 'http://example.com/#anchor',
        query: {
          foo: 'bar'
        },
        expect: 'http://example.com/?foo=bar#anchor'
      }, {
        url: 'http://example.com/?bam=baz#anchor',
        query: {
          foo: 'bar'
        },
        expect: 'http://example.com/?bam=baz&foo=bar#anchor'
      }, {
        url: 'http://example.com/?foo=bam#anchor',
        query: {
          foo: 'bar'
        },
        expect: 'http://example.com/?foo=bar#anchor'
      }];

      var add = util.addQueryParams;
      for (var i = 0, ii = cases.length; i < ii; ++i) {
        var c = cases[i];
        assert.equal(add(c.url, c.query), c.expect, 'case ' + i);
      }

    });

  });

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
