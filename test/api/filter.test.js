/* eslint-env mocha */
const assert = require('chai').assert;

const filter = require('../../api/filter');

describe('api/filter', function () {
  describe('and()', function () {
    it('creates an AndFilter', function () {
      const where = filter.geometry('place', {
        type: 'Point',
        coordinates: [0, 0],
      });
      const when = filter.dates('acquired', {
        gt: new Date('2000-01-01T12:00:00.000Z'),
      });
      assert.deepEqual(filter.and([where, when]), {
        type: 'AndFilter',
        config: [
          {
            type: 'GeometryFilter',
            field_name: 'place',
            config: {
              type: 'Point',
              coordinates: [0, 0],
            },
          },
          {
            type: 'DateRangeFilter',
            field_name: 'acquired',
            config: {
              gt: '2000-01-01T12:00:00.000Z',
            },
          },
        ],
      });
    });
  });

  describe('or()', function () {
    it('creates an OrFilter', function () {
      const where = filter.geometry('place', {
        type: 'Point',
        coordinates: [0, 0],
      });
      const when = filter.dates('acquired', {
        gt: new Date('2000-01-01T12:00:00.000Z'),
      });
      assert.deepEqual(filter.or([where, when]), {
        type: 'OrFilter',
        config: [
          {
            type: 'GeometryFilter',
            field_name: 'place',
            config: {
              type: 'Point',
              coordinates: [0, 0],
            },
          },
          {
            type: 'DateRangeFilter',
            field_name: 'acquired',
            config: {
              gt: '2000-01-01T12:00:00.000Z',
            },
          },
        ],
      });
    });
  });

  describe('not()', function () {
    it('creates an NotFilter', function () {
      const where = filter.geometry('place', {
        type: 'Point',
        coordinates: [0, 0],
      });
      const when = filter.dates('acquired', {
        gt: new Date('2000-01-01T12:00:00.000Z'),
      });
      assert.deepEqual(filter.not([where, when]), {
        type: 'NotFilter',
        config: [
          {
            type: 'GeometryFilter',
            field_name: 'place',
            config: {
              type: 'Point',
              coordinates: [0, 0],
            },
          },
          {
            type: 'DateRangeFilter',
            field_name: 'acquired',
            config: {
              gt: '2000-01-01T12:00:00.000Z',
            },
          },
        ],
      });
    });
  });

  describe('dates()', function () {
    it('creates a DateRangeFilter', function () {
      const then = new Date(0);
      const now = new Date();
      const when = filter.dates('time', {
        gte: then,
        lt: now,
      });
      assert.deepEqual(when, {
        type: 'DateRangeFilter',
        field_name: 'time',
        config: {
          gte: then.toISOString(),
          lt: now.toISOString(),
        },
      });
    });
  });

  describe('geometry()', function () {
    it('creates a GeometryFilter', function () {
      const nullIsland = {
        type: 'Point',
        coordinates: [0, 0],
      };
      const place = filter.geometry('footprint', nullIsland);
      assert.deepEqual(place, {
        type: 'GeometryFilter',
        field_name: 'footprint',
        config: nullIsland,
      });
    });
  });

  describe('numbers()', function () {
    it('creates a NumberInFilter', function () {
      const medal = filter.numbers('rank', [1, 2, 3]);
      assert.deepEqual(medal, {
        type: 'NumberInFilter',
        field_name: 'rank',
        config: [1, 2, 3],
      });
    });
  });

  describe('range()', function () {
    it('creates a RangeFilter', function () {
      const aboveAverage = filter.range('fraction', {gt: 0.5, lte: 1});
      assert.deepEqual(aboveAverage, {
        type: 'RangeFilter',
        field_name: 'fraction',
        config: {gt: 0.5, lte: 1},
      });
    });
  });

  describe('strings()', function () {
    it('creates a StringInFilter', function () {
      const mediocre = filter.strings('grade', ['C', 'D', 'F']);
      assert.deepEqual(mediocre, {
        type: 'StringInFilter',
        field_name: 'grade',
        config: ['C', 'D', 'F'],
      });
    });
  });

  describe('permissions()', function () {
    it('creates a PermissionFilter', function () {
      const hasAccess = filter.permissions([
        'assets.analytic:download',
        'assets.visual:download',
      ]);
      assert.deepEqual(hasAccess, {
        type: 'PermissionFilter',
        config: ['assets.analytic:download', 'assets.visual:download'],
      });
    });
  });
});
