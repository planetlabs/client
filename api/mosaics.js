/**
 * Provides methods for getting scene metadata.
 * @module planet-client/api/mosaics
 */

var Page = require('./page');
var request = require('./request');
var urls = require('./urls');

/**
 * Get metadata for a single mosaic.
 * @param {string} id A mosaic identifier.
 * @param {Object} options Options.
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
    url: urls.mosaics(id),
    terminator: options.terminator
  };
  return request.get(config).then(function(res) {
    return res.body;
  });
}

/**
 * Get a collection of mosaic metadata.
 * @param {Object} query A query object.
 * @param {Object} options Options.
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
    url: urls.mosaics(),
    query: query,
    terminator: options.terminator
  };
  return request.get(config).then(function(res) {
    return new Page(res.body, search, options);
  });
}

exports.search = search;
exports.get = get;
