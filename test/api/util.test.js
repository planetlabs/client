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

  describe('augmentQuadLinks()', function() {
    var quad;

    beforeEach(function() {
      quad = util.assign({}, {
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [-78.925781239, 39.0959629318],
              [-78.925781239, 38.9594087879],
              [-78.749999989, 38.9594087879],
              [-78.749999989, 39.0959629318],
              [-78.925781239, 39.0959629318]
            ]
          ]
        },
        type: 'Feature',
        id: 'L15-0575E-1265N',
        properties: {
          updated: '2015-07-20T13:39:49.550576+00:00',
          'num_input_scenes': 28,
          links: {
            self: 'https://example.com/mosaics/one/quads/two',
            full: 'https://example.com/mosaics/one/quads/two/full',
            thumbnail: 'https://example.com/mosaics/one/quads/two/thumb',
            mosaic: 'https://example.com/mosaics/one',
            scenes: 'https://example.com/mosaics/one/quads/two/scenes/'
          },
          'percent_covered': 100
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

      var augmented = util.augmentQuadLinks(quad);
      assert.equal(augmented.properties.links.full,
          'https://example.com/mosaics/one/quads/two/full?api_key=' + key);
      assert.equal(augmented.properties.links.thumbnail,
          'https://example.com/mosaics/one/quads/two/thumb?api_key=' + key);
    });

    it('adds a stored API key to data URLs', function() {
      var key = 'my-key';
      authStore.setKey(key);

      var augmented = util.augmentQuadLinks(quad);
      assert.equal(augmented.properties.links.full,
          'https://example.com/mosaics/one/quads/two/full?api_key=' + key);
      assert.equal(augmented.properties.links.thumbnail,
          'https://example.com/mosaics/one/quads/two/thumb?api_key=' + key);
    });

  });

  describe('augmentMosaicLinks()', function() {
    var mosaic;

    beforeEach(function() {
      mosaic = util.assign({}, {
        name: 'color_balance_mosaic',
        links: {
          quads: 'https://example.com/mosaics/one/quads/',
          self: 'https://example.com/mosaics/one',
          tiles: 'https://s{0-3}.example.com/v0/mosaics/one/{z}/{x}/{y}.png',
          quadmap: 'https://example.com/mosaics/one/quad-map.png'
        },
        'first_acquired': '2014-03-20T15:57:11+00:00',
        datatype: 'byte',
        'quad_size': 4096,
        title: 'A Mosaic',
        'coordinate_system': 'EPSG:3857',
        geometry: {
          type: 'Polygon',
          coordinates: [
            [[-180, -90], [-180, 90], [180, 90], [180, -90], [-180, -90]]
          ]
        },
        'last_acquired': '2015-07-20T02:11:31.947579+00:00',
        'scene_type': 'ortho',
        'quad_pattern': 'L{glevel:d}-{tilex:04d}E-{tiley:04d}N',
        level: 15,
        resolution: 4.77731426716
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

      var augmented = util.augmentMosaicLinks(mosaic);
      assert.equal(augmented.links.tiles,
          'https://s{0-3}.example.com/v0/mosaics/one/{z}/{x}/{y}.png?api_key=' +
          key);
      assert.equal(augmented.links.quadmap,
          'https://example.com/mosaics/one/quad-map.png?api_key=' + key);
    });

    it('adds a stored API key to data URLs', function() {
      var key = 'my-key';
      authStore.setKey(key);

      var augmented = util.augmentMosaicLinks(mosaic);
      assert.equal(augmented.links.tiles,
          'https://s{0-3}.example.com/v0/mosaics/one/{z}/{x}/{y}.png?api_key=' +
          key);
      assert.equal(augmented.links.quadmap,
          'https://example.com/mosaics/one/quad-map.png?api_key=' + key);
    });

  });

});
