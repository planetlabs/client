/**
 * Provides methods to get imagery (or item) metadata.  Individual images are
 * identified by an item `type` and `id`.  To access metadata for a single
 * image, use [`items.get()`](#module:api/items~get).  To
 * search for metadata about multiple items, use
 * [`items.search()`](#module:api/items~search).
 * @module api/items
 */

var pager = require('./pager');
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
 *     module](#module:api/errors) for a list of the possible
 *     error types.
 */
function get(type, id, opt) {
  var options = opt || {};
  var config = {
    url: urls.items(type, id),
    terminator: options.terminator
  };
  return request.get(config).then(function(res) {
    return res.body;
  });
}

/**
 * Get metadata for multiple items.
 * @param {Object} options Options.
 * @param {Array<string>} options.types A list of item type identifiers.
 * @param {Object} options.filter A filter object for the search.
 * @param {string} options.id A saved search identifier.  This can be provided
 *     as an alternative to `types` and `filter` to get items from a
 *     previously saved search.
 * @param {Object} options.query An object with optional `_page_size` and
 *     `_sort` parameters.
 * @param {number} options.limit Limit the result set to this size (by default,
 *     no limit is applied).
 * @param {function(Array,Boolean,Function)} options.each A function that is called once for
 *     each page of data. The each callback takes 3 arguments. The first is an array of features. The second is a boolean representing whether there are more results, the third is a function that gets the next page of results. If `each` returns false, it prevents automatic paging.
 *     If the `each` callback is absent, all data will be
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
    query: options.query || {},
    limit: options.limit,
    terminator: options.terminator
  };
  if (!config.query._page_size) {
    config.query._page_size = 250; // default so we can bail early on incomplete pages
  }

  if (options.filter && options.types) {
    config.url = urls.quickSearch();
    config.method = 'POST';
    config.body = {
      filter: options.filter,
      item_types: options.types
    };
  } else if (options.id) {
    config.url = urls.searches(options.id, 'results');
  } else {
    throw new Error('Expected both `filter` and `types` or a serach `id`.');
  }
  return pager(config, 'features', options.each);
}

exports.search = search;
exports.get = get;
