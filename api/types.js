/**
 * Provides methods to get information on the available item types.
 * @module api/types
 */

var pager = require('./pager');
var request = require('./request');
var urls = require('./urls');

/**
 * Get metadata for a single item type.
 * @param {string} id An item type identifier.
 * @param {Object} options Options.
 * @param {function(function())} options.terminator A function that is called
 *     with a function that can be called back to terminate the request.
 * @return {Promise.<Object>} A promise that resolves to item type metadata or
 *     is rejected with any error.  See the [`errors`
 *     module](#module:api/errors) for a list of the possible
 *     error types.
 */
function get(id, opt) {
  var options = opt || {};
  var config = {
    url: urls.types(id),
    terminator: options.terminator
  };
  return request.get(config).then(function(res) {
    return res.body;
  });
}

/**
 * Get metadata for multiple item types.
 * @param {Object} options Options.
 * @param {Object} options.query A query object.
 * @param {function(Array)} options.each A function that is called once for
 *     each page of data.  If the `each` callback is absent, all data will be
 *     concatenated and provided when the promise resolves.
 * @param {function(function())} options.terminator A function that is called
 *     with a function that can be called back to terminate the request.
 * @return {Promise<Array>} A promise that resolves when all data is finished
 *     loading or is rejected with any error.  If an `each` callback is not
 *     provided, the promise will resolve with all data concatenated.
 *     See the [`errors` module](#module:api/errors) for a list of
 *     the possible error types.
 */
function search(opt) {
  var options = opt || {};
  var config = {
    url: urls.types(),
    query: options.query,
    terminator: options.terminator
  };
  return pager(config, 'item_types', options.each);
}

exports.search = search;
exports.get = get;
