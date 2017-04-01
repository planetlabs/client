/**
 * Provides methods to get information on items.
 * @module planet-client/api/items
 */

var request = require('./request');
var urls = require('./urls');

/**
 * Get metadata for a single item.
 * @param {string} type An item type identifier.
 * @param {string} id An item identifier.
 * @param {Object} options Options.
 * @param {function(function())} options.terminator A function that is called
 *     with a function that can be called back to terminate the request.
 * @return {Promise.<Object>} A promise that resolves to item metadata or
 *     is rejected with any error.  See the [`errors`
 *     module](#module:planet-client/api/errors) for a list of the possible
 *     error types.
 */
function get(type, id, options) {
  options = options || {};
  var config = {
    url: urls.items(type, id),
    terminator: options.terminator
  };
  return request.get(config).then(function(res) {
    return res.body;
  });
}

exports.get = get;
