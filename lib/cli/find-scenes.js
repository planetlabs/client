var log = require('npmlog');

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
 * Recursively fetch all pages until the limit is reached.
 * @param {Promise.<Page>} promise A promise that resolves to a page of scenes.
 * @param {Array} scenes An array of scene metadata.
 * @param {number} limit The limit.
 * @return {Promise.<Array>} An array that resolves to an array of scenes.
 */
function fetch(promise, scenes, limit) {
  return promise.then(function(page) {
    scenes = scenes.concat(page.data.features);
    if (page.next && scenes.length < limit) {
      return fetch(page.next(), scenes, limit);
    } else {
      if (scenes.length > limit) {
        scenes.length = limit;
      }
      return scenes;
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
  return resolveIntersects(opts.intersects)
    .then(function(geom) {
      var query = {
        intersects: geom,
        count: Math.min(opts.limit, 500)
      };
      return fetch(scenes.find(query, {augmentLinks: false}), [], opts.limit);
    }).then(function(scenes) {
      return JSON.stringify({
        type: 'FeatureCollection',
        features: scenes
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
