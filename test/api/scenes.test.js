/* eslint-env mocha */

var assert = require('chai').assert;

var Page = require('../../api/page');
var auth = require('../../api/auth');
var request = require('../../api/request');
var scenes = require('../../api/scenes');
var urls = require('../../api/urls');
var util = require('../../api/util');

var SCENES = 'https://api.planet.com/v0/scenes/';

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
      assert.equal(arg.url, urls.join(SCENES, 'foo', 'bar'));

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
      assert.equal(calls[0].url, urls.join(SCENES, 'ortho', 'bar'));

      promise.then(function(got) {
        assert.deepEqual(got, scene);
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
      assert.equal(arg.url, urls.join(SCENES, 'landsat', ''));
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
      assert.equal(arg.url, urls.join(SCENES, 'ortho', ''));
      assert.deepEqual(arg.query, query);

      promise.then(function(got) {
        assert.instanceOf(got, Page);
        assert.lengthOf(got.data.features, 1);
        assert.deepEqual(got.data.features[0], scene);
        done();
      }).catch(done);
    });

    it('maintains the provider when paging', function(done) {
      var calls = [];
      var provider = 'landsat';

      request.get = function(config) {
        calls.push(config);
        return Promise.resolve({
          body: {
            features: [scene],
            links: {
              next: 'http://example.com/foo/'
            }
          }
        });
      };

      var query = {
        'acquired.lte': new Date().toISOString(),
        type: provider
      };

      var promise = scenes.search(query);

      promise.then(function(page) {
        page.next().then(function(nextPage) {
          assert.lengthOf(calls, 2);
          assert.equal(calls[1].url, urls.join(SCENES, provider, ''));
          done();
        }).catch(done);
      }).catch(done);
    });

  });

});
