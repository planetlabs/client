/**
 * Provides methods for getting mosaic quad metadata.
 * @module planet-client/api/quads
 */

var Page = require('./page');
var request = require('./request');
var urls = require('./urls');

/**
 * Get metadata for a mosaic quad.
 * @param {string} mosaicId A mosaic identifier.
 * @param {string} quadId A quad identifier.
 * @param {Object} options Options.
 * @param {function(function())} options.terminator A function that is called
 *     with a function that can be called back to terminate the request.
 * @return {Promise.<Object>} A promise that resolves to quad metadata or is
 *     rejected with any error.
 *     See the [`errors` module](#module:planet-client/api/errors) for a list of
 *     the possible error types.
 */
function get(mosaicId, quadId, options) {
  options = options || {};
  var config = {
    url: urls.mosaics(mosaicId, 'quads', quadId),
    terminator: options.terminator
  };
  return request.get(config).then(function(res) {
    return res.body;
  });
}

/**
 * Get a collection of quad metadata based on a query.
 * @param {string} mosaicId A mosaic identifier.
 * @param {Object} query A query object.
 * @param {Object} options Options.
 * @param {function(function())} options.terminator A function that is called
 *     with a function that can be called back to terminate the request.
 * @return {Promise.<module:planet-client/api/page~Page>} A promise that
 *     resolves to a page of quad metadata or is rejected with any error.
 *     See the [`errors` module](#module:planet-client/api/errors) for a list of
 *     the possible error types.
 */
function search(mosaicId, query, options) {
  options = options || {};
  var config = {
    url: urls.mosaics(mosaicId, 'quads', ''),
    query: query,
    terminator: options.terminator
  };
  return request.get(config).then(function(res) {
    return new Page(res.body, search.bind(null, mosaicId));
  });
}

/**
 * Get scenes for a mosaic quad.
 * @param {string} mosaicId A mosaic identifier.
 * @param {string} quadId A quad identifier.
 * @param {Object} options Options.
 * @param {function(function())} options.terminator A function that is called
 *     with a function that can be called back to terminate the request.
 * @return {Promise.<Object>} A promise that resolves to quad metadata or is
 *     rejected with any error.
 *     See the [`errors` module](#module:planet-client/api/errors) for a list of
 *     the possible error types.
 */
function scenes(mosaicId, quadId, options) {
  options = options || {};
  var config = {
    url: urls.mosaics(mosaicId, 'quads', quadId, 'scenes', ''),
    terminator: options.terminator
  };
  return request.get(config).then(function(res) {
    return res.body;
  });
}

exports.search = search;
exports.get = get;
exports.scenes = scenes;
