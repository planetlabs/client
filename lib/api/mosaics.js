/**
 * Provides methods for getting scene metadata.
 * @module mosaics
 */

var Page = require('./page');
var request = require('./request');
var urls = require('./urls');

/**
 * Get metadata for a single mosaic.
 * @param {string} id A mosaic identifier.
 * @return {Promise.<Object>} A promise that resolves to mosaic metadata or is
 *     rejected with any error.
 */
function get(id) {
  var url = urls.join(urls.MOSAICS, id);
  return request.get(url).then(function(obj) {
    return obj.data;
  });
}

/**
 * Get a collection of mosaic metadata.
 * @param {Object} query A query object.
 * @return {Promise.<Page>} A promise that resolves to a page of mosaic
 *     metadata or is rejected with any error.
 */
function search(query) {
  var config = {
    url: urls.MOSAICS,
    query: query
  };
  return request.get(config).then(function(obj) {
    return new Page(obj.data, search);
  });
}

exports.search = search;
exports.get = get;
