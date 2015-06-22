var Page = require('./page');
var request = require('./request');
var urls = require('./urls');

/**
 * Get metadata for a mosaic quad.
 * @param {string} mosaicId A mosaic identifier.
 * @param {string} quadId A quad identifier.
 * @return {Promise.<Object>} A promise that resolves to quad metadata or is
 *     rejected with any error.
 */
function get(mosaicId, quadId) {
  var url = urls.join(urls.MOSAICS, mosaicId, 'quads', quadId);
  return request.get(url).then(function(obj) {
    return obj.data;
  });
}

/**
 * Get a collection of quad metadata based on a query.
 * @param {string} mosaicId A mosaic identifier.
 * @param {Object} query A query object.
 * @return {Promise.<Page>} A promise that resolves to a page of quad
 *     metadata or is rejected with any error.
 */
function find(mosaicId, query) {
  var config = {
    url: urls.join(urls.MOSAICS, mosaicId, 'quads', ''),
    query: query
  };
  return request.get(config).then(function(obj) {
    return new Page(obj.data, find.bind(null, mosaicId));
  });
}

exports.find = find;
exports.get = get;
