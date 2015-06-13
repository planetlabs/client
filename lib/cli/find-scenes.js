var scenes = require('../scenes');
var util = require('./util');

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
      intersects: geom,
      count: Math.min(opts.limit, 500)
    };

    if (opts.acquired) {
      var parts = opts.acquired.split('..');
      if (parts.length === 1) {
        query['acquired.eq'] = new Date(parts[0]).toISOString();
      } else if (parts.length === 2) {
        if (parts[0]) {
          query['acquired.gte'] = new Date(parts[0]).toISOString();
        }
        if (parts[1]) {
          query['acquired.lt'] = new Date(parts[1]).toISOString();
        }
      } else {
        return Promise.reject(new Error(
            'Invalid value for the "acquired" option; ' + opts.acquired));
      }
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
 * Find scenes with the given CLI options.
 * @param {Object} opts The CLI options for the find-scenes command.
 * @return {Promise.<string>} A promise that resolves to a GeoJSON feature
 *     collection.
 */
function findScenes(opts) {
  return resolveQuery(opts)
    .then(function(query) {
      return fetch(scenes.find(query, {augmentLinks: false}), [], opts.limit);
    }).then(function(features) {
      return JSON.stringify({
        type: 'FeatureCollection',
        features: features
      }) + '\n';
    });
}

/**
 * Run the find-scenes command with the given options.
 * @param {Object} opts The CLI options for the command.
 * @return {Promise.<string>} A promise that resolves to the string output (a
 *     GeoJSON feature collection) or is rejected with any error.
 */
function main(opts) {
  var promise;
  if (opts.type === 'ortho') {
    promise = findScenes(opts);
  } else {
    promise = Promise.reject(
        new Error('Unsupported "type" option: ' + opts.type));
  }
  return promise;
}

module.exports = main;
