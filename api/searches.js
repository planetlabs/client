/**
 * Provides methods for working with saved searches.
 * @module api/searches
 */

var pager = require('./pager');
var request = require('./request');
var urls = require('./urls');

/**
 * Get metadata for a single search.
 * @param {string} id A search identifier.
 * @param {Object} options Options.
 * @param {function(function())} options.terminator A function that is called
 *     with a function that can be called back to terminate the request.
 * @return {Promise.<Object>} A promise that resolves to search metadata or
 *     is rejected with any error.  See the [`errors`
 *     module](#module:api/errors) for a list of the possible
 *     error types.
 */
function get(id, options) {
  options = options || {};
  var config = {
    url: urls.searches(id),
    terminator: options.terminator
  };
  return request.get(config).then(function(res) {
    return res.body;
  });
}

/**
 * Get metadata for multiple searches.
 * @param {Object} options Options.
 * @param {Object} options.query A query object.  By default `search_type` is
 *     set to `'saved'`, so only saved searches will be returned.  To get
 *     metadata on saved and quick searches, set `query: {search_type: 'all'}`.
 * @param {function(Array)} options.each A function that is called once for
 *     each page of data.  If the `each` callback is absent, all data will be
 *     concatenated and provided when the promise resolves.
 * @param {number} options.limit Limit the result set to this size (by default,
 *     no limit is applied).
 * @param {function(function())} options.terminator A function that is called
 *     with a function that can be called back to terminate the request.
 * @return {Promise<Array>} A promise that resolves when all data is finished
 *     loading or is rejected with any error.  If an `each` callback is not
 *     provided, the promise will resolve with all data concatenated.
 *     See the [`errors` module](#module:api/errors) for a list of
 *     the possible error types.
 */
function search(options) {
  options = options || {};
  var query = Object.assign({search_type: 'saved'}, options.query);
  var config = {
    url: urls.searches(),
    query: query,
    limit: options.limit,
    terminator: options.terminator
  };
  return pager(config, 'searches', options.each);
}

/**
 * Create a new saved search.
 * @param {Object} options Options.
 * @param {string} options.name Search name (required).
 * @param {Array<string>} options.types A list of item type identifiers (required).
 * @param {Object} options.filter A filter object for the search (required).
 * @param {boolean} options.notification Send email notification when new
 *     imagery matches search criteria (`false` by default).
 * @return {Promise<Object>} A promise that resolves to the new search or
 *     is rejected with any error.  See the [`errors`
 *     module](#module:api/errors) for a list of the possible
 *     error types.
 */
function create(options) {
  if (!options) {
    throw new Error('Searches require "name", "types", and "filter"');
  }
  var name = options.name;
  if (!name) {
    throw new Error('Missing search "name"');
  }
  var types = options.types;
  if (!types) {
    throw new Error('Missing search "types"');
  }
  var filter = options.filter;
  if (!filter) {
    throw new Error('Missing search "filter"');
  }
  var config = {
    url: urls.searches(),
    body: {
      name: name,
      item_types: types,
      filter: filter,
      __daily_email_enabled: !!options.notification
    }
  };
  return request.post(config).then(function(res) {
    return res.body;
  });
}

/**
 * Update a saved search.
 * @param {string} id Search identifier.
 * @param {Object} options Options.
 * @param {string} options.name Search name.
 * @param {Array<string>} options.types A list of item type identifiers.
 * @param {Object} options.filter A filter object for the search.
 * @param {boolean} options.notification Send email notification when new
 *     imagery matches search criteria.
 * @return {Promise<Object>} A promise that resolves to the updated search or
 *     is rejected with any error.  See the [`errors`
 *     module](#module:api/errors) for a list of the possible
 *     error types.
 */
function update(id, options) {
  if (!options) {
    throw new Error('Missing "name", "types", or "filter"');
  }
  var search = {};
  if (options.name) {
    search.name = options.name;
  }
  if (options.types) {
    search.item_types = options.types;
  }
  if (options.filter) {
    search.filter = options.filter;
  }
  if ('notification' in options) {
    search.__daily_email_enabled = options.notification;
  }
  var config = {
    url: urls.searches(id),
    body: search
  };
  return request.put(config).then(function(res) {
    return res.body;
  });
}

/**
 * Remove a saved search.
 * @param {string} id Search identifier.
 * @return {Promise} A promise that resolves if the search was removed or
 *     is rejected with any error.  See the [`errors`
 *     module](#module:api/errors) for a list of the possible
 *     error types.
 */
function remove(id) {
  return request.del(urls.searches(id)).then(function() {
    return true;
  });
}

exports.create = create;
exports.get = get;
exports.remove = remove;
exports.search = search;
exports.update = update;
