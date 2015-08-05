/* eslint-env mocha */

var assert = require('chai').assert;

var Page = require('../../api/page');
var auth = require('../../api/auth');
var request = require('../../api/request');
var scenes = require('../../api/scenes');
var urls = require('../../api/urls');
var util = require('../../api/util');

describe('api/scenes', function() {

  var get = request.get;
  afterEach(function() {
    request.get = get;
    auth.logout();
  });

  describe('get()', function() {

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

    it('requests a scene by type and id', function(done) {
      var calls = [];

      request.get = function(config) {
        calls.push(config);
        return Promise.resolve({
          body: scene
        });
      };

      var promise = scenes.get({type: 'foo', id: 'bar'});
      assert.lengthOf(calls, 1);
      var arg = calls[0];
      assert.equal(arg.url, urls.join(urls.SCENES, 'foo', 'bar'));

      promise.then(function(got) {
        assert.deepEqual(got, scene);
        done();
      }).catch(done);
    });

    it('defaults to ortho if only id is provided', function(done) {
      var calls = [];

      request.get = function(config) {
        calls.push(config);
        return Promise.resolve({
          body: scene
        });
      };

      var promise = scenes.get('bar');
      assert.equal(calls[0].url, urls.join(urls.SCENES, 'ortho', 'bar'));

      promise.then(function(got) {
        assert.deepEqual(got, scene);
        done();
      }).catch(done);
    });

    it('augments links if key is set', function(done) {
      auth.setKey('my-key');

      request.get = function(config) {
        return Promise.resolve({
          body: scene
        });
      };

      var promise = scenes.get('bar');

      promise.then(function(got) {
        assert.equal(got.properties.links.full,
            'http://example.com/?api_key=my-key#hash');
        done();
      }).catch(done);
    });

    it('can be told not to augment links', function(done) {
      auth.setKey('my-key');

      request.get = function(config) {
        return Promise.resolve({
          body: scene
        });
      };

      var promise = scenes.get('bar', {augmentLinks: false});

      promise.then(function(got) {
        assert.equal(got.properties.links.full,
            'http://example.com/#hash');
        done();
      }).catch(done);
    });

  });

  describe('search()', function() {

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

    it('queries the scenes collection', function(done) {
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

      var query = {
        'acquired.lte': new Date().toISOString(),
        type: 'landsat'
      };

      var promise = scenes.search(query);

      var arg = calls[0];
      assert.equal(arg.url, urls.join(urls.SCENES, 'landsat', ''));
      assert.deepEqual(arg.query, query);

      promise.then(function(got) {
        assert.instanceOf(got, Page);
        assert.lengthOf(got.data.features, 1);
        assert.deepEqual(got.data.features[0], scene);
        done();
      }).catch(done);
    });

    it('defaults to ortho if no type provided', function(done) {
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

      var query = {
        'acquired.lte': new Date().toISOString()
      };

      var promise = scenes.search(query);

      var arg = calls[0];
      assert.equal(arg.url, urls.join(urls.SCENES, 'ortho', ''));
      assert.deepEqual(arg.query, query);

      promise.then(function(got) {
        assert.instanceOf(got, Page);
        assert.lengthOf(got.data.features, 1);
        assert.deepEqual(got.data.features[0], scene);
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

      scenes.search({foo: 'bar'}).then(function(got) {
        assert.equal(got.data.features[0].properties.links.full,
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

      scenes.search({foo: 'bar'}, {augmentLinks: false}).then(function(got) {
        assert.equal(got.data.features[0].properties.links.full,
            'http://example.com/#hash');
        done();
      }).catch(done);
    });

  });

});
