/**
 * Provides methods for getting mosaic quad metadata.
 * @module planet-client/api/quads
 */

var Page = require('./page');
var request = require('./request');
var urls = require('./urls');
var util = require('./util');

/**
 * Get metadata for a mosaic quad.
 * @param {string} mosaicId A mosaic identifier.
 * @param {string} quadId A quad identifier.
 * @param {Object} options Options.
 * @param {boolean} options.augmentLinks Add API key to links for image
 *     resources in the response.  True by default.
 * @param {function(function())} options.terminator A function that is called
 *     with a function that can be called back to terminate the request.
 * @return {Promise.<Object>} A promise that resolves to quad metadata or is
 *     rejected with any error.
 */
function get(mosaicId, quadId, options) {
  options = options || {};
  var config = {
    url: urls.join(urls.MOSAICS, mosaicId, 'quads', quadId),
    terminator: options.terminator
  };
  return request.get(config).then(function(res) {
    if (options.augmentLinks !== false) {
      util.augmentQuadLinks(res.body);
    }
    return res.body;
  });
}

/**
 * Get a collection of quad metadata based on a query.
 * @param {string} mosaicId A mosaic identifier.
 * @param {Object} query A query object.
 * @param {Object} options Options.
 * @param {boolean} options.augmentLinks Add API key to links for image
 *     resources in the response.  True by default.
 * @param {function(function())} options.terminator A function that is called
 *     with a function that can be called back to terminate the request.
 * @return {Promise.<Page>} A promise that resolves to a page of quad
 *     metadata or is rejected with any error.
 */
function search(mosaicId, query, options) {
  options = options || {};
  var config = {
    url: urls.join(urls.MOSAICS, mosaicId, 'quads', ''),
    query: query,
    terminator: options.terminator
  };
  return request.get(config).then(function(res) {
    if (options.augmentLinks !== false) {
      var quads = res.body.features;
      for (var i = 0, ii = quads.length; i < ii; ++i) {
        util.augmentQuadLinks(quads[i]);
      }
    }
    return new Page(res.body, search.bind(null, mosaicId));
  });
}

/**
 * Get scenes for a mosaic quad.
 * @param {string} mosaicId A mosaic identifier.
 * @param {string} quadId A quad identifier.
 * @param {Object} options Options.
 * @param {boolean} options.augmentLinks Add API key to links for image
 *     resources in the response.  True by default.
 * @param {function(function())} options.terminator A function that is called
 *     with a function that can be called back to terminate the request.
 * @return {Promise.<Object>} A promise that resolves to quad metadata or is
 *     rejected with any error.
 */
function scenes(mosaicId, quadId, options) {
  options = options || {};
  var config = {
    url: urls.join(urls.MOSAICS, mosaicId, 'quads', quadId, 'scenes', ''),
    terminator: options.terminator
  };
  return request.get(config).then(function(res) {
    if (options.augmentLinks !== false) {
      var features = res.body.features;
      for (var i = 0, ii = features.length; i < ii; ++i) {
        util.augmentSceneLinks(features[i]);
      }
    }
    return res.body;
  });
}

exports.search = search;
exports.get = get;
exports.scenes = scenes;
