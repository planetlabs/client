var path = require('path');

var log = require('npmlog');

var quads = require('../quads');
var util = require('./util');

var script = path.basename(__filename, '.js');

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

/**
 * Given CLI options, resolve the query for finding scenes.
 * @param {Object} opts CLI options.
 * @return {Promise.<Object>} A promise that resolves to a query object.
 */
function resolveQuery(opts) {
  return resolveIntersects(opts.intersects).then(function(geom) {
    var query = {
      intersects: geom
    };
    return query;
  });
}

/**
 * Recursively fetch all pages until the limit is reached.
 * @param {Promise.<Page>} promise A promise that resolves to a page of quads.
 * @param {Array} features An array of quad metadata.
 * @param {number} limit The limit.
 * @return {Promise.<Array>} An array that resolves to an array of quads.
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
 * Run the find-quads command with the given options.
 * @param {Object} opts The CLI options for the command.
 * @return {Promise.<string>} A promise that resolves to the string output (a
 *     GeoJSON feature collection) or is rejected with any error.
 */
function main(opts) {
  return resolveQuery(opts)
    .then(function(query) {
      log.verbose(script, 'query: %j', query);
      return fetch(quads.find(opts.mosaic, query), [], opts.limit);
    }).then(function(features) {
      return JSON.stringify({
        type: 'FeatureCollection',
        features: features
      }) + '\n';
    });
}

/**
 * Options for the find-scenes command.
 * @type {Object}
 */
var options = {
  mosaic: {
    alias: 'm',
    description: 'Mosaic identifier',
    required: true
  },
  limit: {
    alias: 'l',
    description: 'Limit the number of results',
    default: 1000
  },
  intersects: {
    description: 'Find mosaic quads in the given area (GeoJSON, WKT, @FILE, or @- for stdin)'
  }
};

exports.description = 'Find mosaic quads';
exports.main = main;
exports.options = options;
