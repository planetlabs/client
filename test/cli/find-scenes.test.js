/* eslint-env mocha */
var assert = require('chai').assert;

var Page = require('../../api/page');
var findScenes = require('../../cli/find-scenes');
var scenes = require('../../api/scenes');
var util = require('../../cli/util');

describe('cli/find-scenes', function() {

  describe('fetch()', function() {

    var numPages = 10;
    var fetched = 0;

    function makePage() {
      ++fetched;
      var more = fetched < numPages;
      var data = {
        features: ['first feature', 'second feature'],
        links: {
          next: more ? 'http://example.com/more' : null
        }
      };
      return new Page(data, factory);
    }

    function factory() {
      return Promise.resolve(makePage());
    }

    beforeEach(function() {
      fetched = 0;
    });

    it('concatenates pages of features', function(done) {
      var promise = Promise.resolve(makePage());

      findScenes.fetch(promise, [], 100).then(function(features) {
        assert.lengthOf(features, 20);
        done();
      }).catch(done);
    });

    it('stops when the limit is reached', function(done) {
      var promise = Promise.resolve(makePage());

      findScenes.fetch(promise, [], 11).then(function(features) {
        assert.lengthOf(features, 11);
        done();
      }).catch(done);
    });

  });

  describe('main()', function() {

    var search = scenes.search;
    afterEach(function() {
      scenes.search = search;
    });

    it('calls scenes.search() with a query', function(done) {
      var calls = [];
      var features = [];

      scenes.search = function() {
        calls.push(arguments);
        var data = {
          features: features,
          links: {}
        };
        var page = new Page(data, scenes.search);
        return Promise.resolve(page);
      };

      var opts = {
        type: 'landsat',
        limit: 250
      };
      findScenes.main(opts).then(function(str) {
        assert.typeOf(str, 'string');
        done();
      }).catch(done);
    });

  });

  describe('parseWhere()', function() {

    var parse = findScenes.parseWhere;

    it('adds a where clause to the query when passed a valid string', function() {
      var q = {};
      parse('sat.alt.gte=200', q);
      assert.deepEqual(q, {'sat.alt.gte': '200'});
    });

    it('adds multiple where clauses to the query when passed an array', function() {
      var q = {};
      parse(['sun.alt.gte=250', 'sun.alt.lte=400'], q);
      assert.deepEqual(q, {
        'sun.alt.gte': '250',
        'sun.alt.lte': '400'
      });
    });

    it('Ignores where clauses if not properly formatted', function() {
      var q = {};
      parse(['sun.alt.gte=250', 'sun.alt.lte'], q);
      assert.deepEqual(q, {'sun.alt.gte': '250'});
    });

  });

  describe('parseAcquired()', function() {
    var parse = findScenes.parseAcquired;

    it('appends start end end times to the query', function() {
      var cases = [{
        acquired: '2015-01-01T00:00:00.000Z..2016-01-01T00:00:00.000Z',
        query: {
          'acquired.gte': '2015-01-01T00:00:00.000Z',
          'acquired.lt': '2016-01-01T00:00:00.000Z'
        }
      }, {
        acquired: '2015..2016',
        query: {
          'acquired.gte': '2015-01-01T00:00:00.000Z',
          'acquired.lt': '2016-01-01T00:00:00.000Z'
        }
      }, {
        acquired: '2015',
        query: {
          'acquired.gte': '2015-01-01T00:00:00.000Z',
          'acquired.lt': '2016-01-01T00:00:00.000Z'
        }
      }, {
        acquired: '2015-06',
        query: {
          'acquired.gte': '2015-06-01T00:00:00.000Z',
          'acquired.lt': '2015-07-01T00:00:00.000Z'
        }
      }, {
        acquired: '2015-06-01',
        query: {
          'acquired.gte': '2015-06-01T00:00:00.000Z',
          'acquired.lt': '2015-06-02T00:00:00.000Z'
        }
      }, {
        acquired: '2015-06-30',
        query: {
          'acquired.gte': '2015-06-30T00:00:00.000Z',
          'acquired.lt': '2015-07-01T00:00:00.000Z'
        }
      }, {
        acquired: '2015-06-01T00:00:00.000Z',
        query: {
          'acquired.eq': '2015-06-01T00:00:00.000Z'
        }
      }, {
        acquired: '..2015-06-01T00:00:00.000Z',
        query: {
          'acquired.lt': '2015-06-01T00:00:00.000Z'
        }
      }, {
        acquired: '..2015',
        query: {
          'acquired.lt': '2015-01-01T00:00:00.000Z'
        }
      }, {
        acquired: '2015-06-01T00:00:00.000Z..',
        query: {
          'acquired.gte': '2015-06-01T00:00:00.000Z'
        }
      }, {
        acquired: '2015..',
        query: {
          'acquired.gte': '2015-01-01T00:00:00.000Z'
        }
      }];

      for (var i = 0, ii = cases.length; i < ii; ++i) {
        var c = cases[i];
        var q = {};
        parse(c.acquired, q);
        assert.deepEqual(q, c.query, 'case ' + i);
      }
    });

    it('throws for invalid dates', function() {
      var cases = [
        'foo',
        '2015..foo',
        'foo..2015',
        '2014..2015..2016'
      ];

      for (var i = 0, ii = cases.length; i < ii; ++i) {
        assert.throws(
            parse.bind(null, cases[i], {}),
            'Invalid date for "acquired" option:',
            'case ' + i);
      }
    });

  });

  describe('resolveIntersects()', function() {

    var orig = {};
    beforeEach(function() {
      for (var key in util) {
        orig[key] = util[key];
      }
    });

    afterEach(function() {
      for (var key in orig) {
        util[key] = orig[key];
      }
      orig = {};
    });

    var resolveIntersects = findScenes.resolveIntersects;

    it('resolves to null for falsey values', function(done) {
      resolveIntersects('').then(function(val) {
        assert.isNull(val);
        done();
      }).catch(done);
    });

    it('resolves stdin for @-', function(done) {
      util.stdin = function() {
        return Promise.resolve('read stdin');
      };

      resolveIntersects('@-').then(function(val) {
        assert.equal(val, 'read stdin');
        done();
      }).catch(done);
    });

    it('resolves stdin for @-', function(done) {
      util.stdin = function() {
        return Promise.resolve('read stdin');
      };

      resolveIntersects('@-').then(function(val) {
        assert.equal(val, 'read stdin');
        done();
      }).catch(done);
    });

    it('reads a file for other @', function(done) {
      util.readFile = function(name) {
        return Promise.resolve('read ' + name);
      };

      resolveIntersects('@foo.txt').then(function(val) {
        assert.equal(val, 'read foo.txt');
        done();
      }).catch(done);
    });

    it('resolves to the value for all other', function(done) {
      resolveIntersects('POINT(1 1)').then(function(val) {
        assert.equal(val, 'POINT(1 1)');
        done();
      }).catch(done);
    });

  });

  describe('resolveQuery()', function() {

    var resolveQuery = findScenes.resolveQuery;

    it('resolves to a query given command options', function(done) {
      var opts = {
        intersects: 'POINT(1 1)',
        type: 'landsat',
        limit: 300
      };

      resolveQuery(opts).then(function(query) {
        assert.deepEqual(query, {
          intersects: 'POINT(1 1)',
          type: 'landsat',
          count: 300
        });
        done();
      }).catch(done);
    });

    it('generates a query given acquired option', function(done) {
      var opts = {
        acquired: '2000..',
        type: 'ortho',
        limit: 250
      };

      resolveQuery(opts).then(function(query) {
        assert.deepEqual(query, {
          'acquired.gte': '2000-01-01T00:00:00.000Z',
          type: 'ortho',
          count: 250
        });
        done();
      }).catch(done);
    });

    it('generates a query given where options', function(done) {
      var opts = {
        where: ['acquired.gt=2000', 'gsd.gt=10'],
        type: 'ortho',
        limit: 250
      };

      resolveQuery(opts).then(function(query) {
        assert.deepEqual(query, {
          'acquired.gt': '2000',
          'gsd.gt': '10',
          type: 'ortho',
          count: 250
        });
        done();
      }).catch(done);
    });

  });

});
