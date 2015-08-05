/* eslint-env mocha */

var assert = require('chai').assert;

var Page = require('../../api/page');
var auth = require('../../api/auth');
var request = require('../../api/request');
var mosaics = require('../../api/mosaics');
var urls = require('../../api/urls');
var util = require('../../api/util');

describe('api/mosaics', function() {

  var mosaic;
  beforeEach(function() {
    mosaic = util.assign({}, {
      name: 'one',
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

  var get = request.get;
  afterEach(function() {
    request.get = get;
    auth.logout();
  });

  describe('get()', function() {

    it('requests a mosiac by id', function(done) {
      var calls = [];

      request.get = function(config) {
        calls.push(config);
        return Promise.resolve({
          body: mosaic
        });
      };

      var promise = mosaics.get('one');
      assert.lengthOf(calls, 1);
      var arg = calls[0];
      assert.equal(arg.url, urls.join(urls.MOSAICS, 'one'));

      promise.then(function(got) {
        assert.deepEqual(got, mosaic);
        done();
      }).catch(done);
    });

    it('augments links if key is set', function(done) {
      auth.setKey('my-key');

      request.get = function(config) {
        return Promise.resolve({
          body: mosaic
        });
      };

      var promise = mosaics.get('one');

      promise.then(function(got) {
        assert.equal(got.links.tiles,
            'https://s{0-3}.example.com/v0/mosaics/one/{z}/{x}/{y}.png' +
            '?api_key=my-key');
        done();
      }).catch(done);
    });

    it('can be told not to augment links', function(done) {
      auth.setKey('my-key');

      request.get = function(config) {
        return Promise.resolve({
          body: mosaic
        });
      };

      var promise = mosaics.get('one', {augmentLinks: false});

      promise.then(function(got) {
        assert.equal(got.links.tiles,
            'https://s{0-3}.example.com/v0/mosaics/one/{z}/{x}/{y}.png');
        done();
      }).catch(done);
    });

  });

  describe('search()', function() {

    it('queries the mosaics collection', function(done) {
      var calls = [];

      request.get = function(config) {
        calls.push(config);
        return Promise.resolve({
          body: {
            mosaics: [mosaic],
            links: {}
          }
        });
      };

      var query = {
        count: 1
      };

      var promise = mosaics.search(query);

      var arg = calls[0];
      assert.equal(arg.url, urls.MOSAICS);
      assert.deepEqual(arg.query, query);

      promise.then(function(got) {
        assert.instanceOf(got, Page);
        assert.lengthOf(got.data.mosaics, 1);
        assert.deepEqual(got.data.mosaics[0], mosaic);
        done();
      }).catch(done);
    });

    it('augments links if key is set', function(done) {
      auth.setKey('my-key');

      request.get = function(config) {
        return Promise.resolve({
          body: {
            mosaics: [mosaic],
            links: {}
          }
        });
      };

      mosaics.search({}).then(function(got) {
        assert.equal(got.data.mosaics[0].links.tiles,
            'https://s{0-3}.example.com/v0/mosaics/one/{z}/{x}/{y}.png?' +
            'api_key=my-key');
        done();
      }).catch(done);
    });

    it('can be told not to augment links', function(done) {
      auth.setKey('my-key');

      request.get = function(config) {
        return Promise.resolve({
          body: {
            mosaics: [mosaic],
            links: {}
          }
        });
      };

      mosaics.search({}, {augmentLinks: false}).then(function(got) {
        assert.equal(got.data.mosaics[0].links.tiles,
            'https://s{0-3}.example.com/v0/mosaics/one/{z}/{x}/{y}.png');
        done();
      }).catch(done);
    });

  });

});
