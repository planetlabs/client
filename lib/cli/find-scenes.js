var path = require('path');

var bole = require('bole');

var scenes = require('../scenes');
var util = require('./util');

var log = bole(path.basename(__filename, '.js'));

/**
 * Given an intersects option value, resolve the intersects value.
 * @param {string} val The intersects option (e.g. "POINT(0 0)" or "@-")
 * @return {Promise.<string>} A promise that resolves to an intersects string
 *     (or null if none provided).
 */
function resolveIntersects(val) {
  var promise;
  if (!val) {
    promise = Promise.resolve(null);
  } else if (val === '@-') {
    promise = util.stdin();
  } else if (val.indexOf('@') === 0) {
    promise = util.readFile(val.slice(1));
  } else {
    promise = Promise.resolve(val);
  }
  return promise;
}

var DATE_RE = /^\d{4}(-\d{2}(-\d{2})?)?$/;

/**
 * Parse the acquired option and add to the query.
 * @param {string} acquired A date or .. delimited range of dates.
 * @param {Object} query The query object.
 */
function parseAcquired(acquired, query) {
  var parts = acquired.split('..');
  var message = 'Invalid date for "acquired" option: ' + acquired;
  var start, end;
  if (parts.length === 1) {
    if (acquired.match(DATE_RE)) {
      var ymd = acquired.split('-').map(Number);
      if (ymd.length === 1) {
        start = new Date(Date.UTC(ymd[0], 0));
        end = new Date(Date.UTC(ymd[0] + 1, 0));
      } else if (ymd.length === 2) {
        start = new Date(Date.UTC(ymd[0], ymd[1] - 1));
        end = new Date(Date.UTC(ymd[0], ymd[1]));
      } else {
        start = new Date(Date.UTC(ymd[0], ymd[1] - 1, ymd[2]));
        end = new Date(Date.UTC(ymd[0], ymd[1] - 1, ymd[2] + 1));
      }
      query['acquired.gte'] = start.toISOString();
      query['acquired.lt'] = end.toISOString();
    } else {
      start = new Date(acquired);
      if (isNaN(start.getTime())) {
        throw new Error(message);
      }
      query['acquired.eq'] = start.toISOString();
    }
  } else if (parts.length === 2) {
    if (parts[0]) {
      start = new Date(parts[0]);
      if (isNaN(start.getTime())) {
        throw new Error(message);
      }
      query['acquired.gte'] = start.toISOString();
    }
    if (parts[1]) {
      end = new Date(parts[1]);
      if (isNaN(end.getTime())) {
        throw new Error(message);
      }
      query['acquired.lt'] = end.toISOString();
    }
  } else {
    throw new Error(message);
  }
}

/**
 * Given CLI options, resolve the query for finding scenes.
 * @param {Object} opts CLI options.
 * @return {Promise.<Object>} A promise that resolves to a query object.
 */
function resolveQuery(opts) {
  return resolveIntersects(opts.intersects).then(function(geom) {
    var query = {
      type: opts.type,
      intersects: geom,
      count: Math.min(opts.limit, 500)
    };

    if (opts.acquired) {
      parseAcquired(opts.acquired, query);
    }
    return query;
  });
}

/**
 * Recursively fetch all pages until the limit is reached.
 * @param {Promise.<Page>} promise A promise that resolves to a page of scenes.
 * @param {Array} features An array of scene metadata.
 * @param {number} limit The limit.
 * @return {Promise.<Array>} An array that resolves to an array of scenes.
 */
function fetch(promise, features, limit) {
  return promise.then(function(page) {
    features = features.concat(page.data.features);
    if (page.next && features.length < limit) {
      return fetch(page.next(), features, limit);
    } else {
      if (features.length > limit) {
        features.length = limit;
      }
      return features;
    }
  });
}

/**
 * Run the find-scenes command with the given options.
 * @param {Object} opts The CLI options for the command.
 * @return {Promise.<string>} A promise that resolves to the string output (a
 *     GeoJSON feature collection) or is rejected with any error.
 */
function main(opts) {
  return resolveQuery(opts)
    .then(function(query) {
      log.debug('query: %j', query);
      return fetch(scenes.find(query, {augmentLinks: false}), [], opts.limit);
    }).then(function(features) {
      return JSON.stringify({
        type: 'FeatureCollection',
        features: features
      }) + '\n';
    });
}

var types = ['ortho', 'landsat'];

/**
 * Options for the find-scenes command.
 * @type {Object}
 */
var options = {
  type: {
    alias: 't',
    description: 'Imagery type' + util.choicesHelp(types),
    default: 'ortho'
  },
  limit: {
    alias: 'l',
    description: 'Limit the number of results',
    default: 1000
  },
  acquired: {
    description: 'Filter by image acquisition time (ISO-8601 formatted date time with .. for ranges).',
    type: 'string'
  },
  intersects: {
    description: 'Find imagery in the given area (GeoJSON, WKT, @FILE, or @- for stdin)'
  }
};

exports.description = 'Find scenes';
exports.main = main;
exports.options = options;

exports.parseAcquired = parseAcquired;
