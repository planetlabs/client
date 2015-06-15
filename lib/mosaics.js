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

exports.get = get;
