/**
 * Provides methods for getting scene metadata.
 * @module planet-client/api/mosaics
 */

var Page = require('./page');
var request = require('./request');
var urls = require('./urls');
var util = require('./util');

/**
 * Get metadata for a single mosaic.
 * @param {string} id A mosaic identifier.
 * @param {Object} options Options.
 * @param {boolean} options.augmentLinks Add API key to links for image
 *     resources in the response.  True by default.
 * @param {function(function())} options.terminator A function that is called
 *     with a function that can be called back to terminate the request.
 * @return {Promise.<Object>} A promise that resolves to mosaic metadata or is
 *     rejected with any error.  See the [`errors`
 *     module](#module:planet-client/api/errors) for a list of the possible
 *     error types.
 */
function get(id, options) {
  options = options || {};
  var config = {
    url: urls.join(urls.MOSAICS, id),
    terminator: options.terminator
  };
  return request.get(config).then(function(res) {
    if (options.augmentLinks !== false) {
      util.augmentMosaicLinks(res.body);
    }
    return res.body;
  });
}

/**
 * Get a collection of mosaic metadata.
 * @param {Object} query A query object.
 * @param {Object} options Options.
 * @param {boolean} options.augmentLinks Add API key to links for image
 *     resources in the response.  True by default.
 * @param {function(function())} options.terminator A function that is called
 *     with a function that can be called back to terminate the request.
 * @return {Promise.<module:planet-client/api/page~Page>} A promise that
 *     resolves to a page of mosaic metadata or is rejected with any error.
 *     See the [`errors` module](#module:planet-client/api/errors) for a list of
 *     the possible error types.
 */
function search(query, options) {
  options = options || {};
  var config = {
    url: urls.MOSAICS,
    query: query,
    terminator: options.terminator
  };
  return request.get(config).then(function(res) {
    if (options.augmentLinks !== false) {
      var mosaics = res.body.mosaics;
      for (var i = 0, ii = mosaics.length; i < ii; ++i) {
        util.augmentMosaicLinks(mosaics[i]);
      }
    }
    return new Page(res.body, search);
  });
}

exports.search = search;
exports.get = get;
