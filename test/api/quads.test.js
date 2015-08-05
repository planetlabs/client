/* eslint-env mocha */

var assert = require('chai').assert;

var Page = require('../../api/page');
var auth = require('../../api/auth');
var request = require('../../api/request');
var quads = require('../../api/quads');
var urls = require('../../api/urls');
var util = require('../../api/util');

describe('api/mosaics', function() {

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

  var get = request.get;
  afterEach(function() {
    request.get = get;
    auth.logout();
  });

  describe('get()', function() {

    it('gets a mosaic quad', function(done) {
      var calls = [];

      request.get = function(config) {
        calls.push(config);
        return Promise.resolve({
          body: quad
        });
      };

      var promise = quads.get('my-mosaic', 'my-quad');
      assert.lengthOf(calls, 1);
      var arg = calls[0];
      assert.equal(arg.url,
          urls.join(urls.MOSAICS, 'my-mosaic', 'quads', 'my-quad'));

      promise.then(function(got) {
        assert.deepEqual(got, quad);
        done();
      }).catch(done);
    });

    it('augments links if key is set', function(done) {
      auth.setKey('my-key');

      request.get = function(config) {
        return Promise.resolve({
          body: quad
        });
      };

      var promise = quads.get('my-mosaic', 'my-quad');

      promise.then(function(got) {
        assert.equal(got.properties.links.full,
            'https://example.com/mosaics/one/quads/two/full' +
            '?api_key=my-key');
        done();
      }).catch(done);
    });

    it('can be told not to augment links', function(done) {
      auth.setKey('my-key');

      request.get = function(config) {
        return Promise.resolve({
          body: quad
        });
      };

      var promise = quads.get('my-mosaic', 'my-quad', {augmentLinks: false});

      promise.then(function(got) {
        assert.equal(got.properties.links.full,
            'https://example.com/mosaics/one/quads/two/full');
        done();
      }).catch(done);
    });

  });

  describe('search()', function() {

    it('queries a mosaic quads collection', function(done) {
      var calls = [];

      request.get = function(config) {
        calls.push(config);
        return Promise.resolve({
          body: {
            features: [quad],
            links: {}
          }
        });
      };

      var query = {
        count: 1
      };

      var promise = quads.search('my-mosaic', query);

      var arg = calls[0];
      assert.equal(arg.url, urls.join(urls.MOSAICS, 'my-mosaic', 'quads', ''));
      assert.deepEqual(arg.query, query);

      promise.then(function(got) {
        assert.instanceOf(got, Page);
        assert.lengthOf(got.data.features, 1);
        assert.deepEqual(got.data.features[0], quad);
        done();
      }).catch(done);
    });

    it('augments links if key is set', function(done) {
      auth.setKey('my-key');

      request.get = function(config) {
        return Promise.resolve({
          body: {
            features: [quad],
            links: {}
          }
        });
      };

      quads.search('my-mosaic', {}).then(function(got) {
        assert.equal(got.data.features[0].properties.links.full,
            'https://example.com/mosaics/one/quads/two/full' +
            '?api_key=my-key');
        done();
      }).catch(done);
    });

    it('can be told not to augment links', function(done) {
      auth.setKey('my-key');

      request.get = function(config) {
        return Promise.resolve({
          body: {
            features: [quad],
            links: {}
          }
        });
      };

      quads.search('my-mosaic', {}, {augmentLinks: false}).then(function(got) {
        assert.equal(got.data.features[0].properties.links.full,
            'https://example.com/mosaics/one/quads/two/full');
        done();
      }).catch(done);
    });

  });

  describe('scenes()', function() {

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

    it('gets scenes that make up a quad', function(done) {
      var calls = [];

      request.get = function(config) {
        calls.push(config);
        return Promise.resolve({
          body: {
            features: [scene],
            links: {}
          }
        });
      };

      var promise = quads.scenes('my-mosaic', 'my-quad');

      var arg = calls[0];
      assert.equal(arg.url, urls.join(
          urls.MOSAICS, 'my-mosaic', 'quads', 'my-quad', 'scenes', ''));

      promise.then(function(got) {
        assert.lengthOf(got.features, 1);
        assert.deepEqual(got.features[0], scene);
        done();
      }).catch(done);
    });

    it('augments links if key is set', function(done) {
      auth.setKey('my-key');

      request.get = function(config) {
        return Promise.resolve({
          body: {
            features: [scene],
            links: {}
          }
        });
      };

      quads.scenes('my-mosaic', 'my-quad').then(function(got) {
        assert.equal(got.features[0].properties.links.full,
            'http://example.com/?api_key=my-key#hash');
        done();
      }).catch(done);
    });

    it('can be told not to augment links', function(done) {
      auth.setKey('my-key');

      request.get = function(config) {
        return Promise.resolve({
          body: {
            features: [scene],
            links: {}
          }
        });
      };

      quads.scenes('my-mosaic', 'my-quad', {augmentLinks: false})
        .then(function(got) {
          assert.equal(got.features[0].properties.links.full,
              'http://example.com/#hash');
          done();
        }).catch(done);
    });

  });

});
