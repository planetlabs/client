/* eslint-env mocha */
var assert = require('chai').assert;

var findScenes = require('../../cli/find-scenes');

describe('cli/find-scenes', function() {

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

});
