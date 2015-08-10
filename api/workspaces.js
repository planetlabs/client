/**
 * Provides methods for working with workspaces.
 * @module planet-client/api/workspaces
 * @private
 */

var request = require('./request');
var urls = require('./urls');

function get(id) {
  var url = urls.join(urls.WORKSPACES, id);
  return request.get(url).then(function(res) {
    return res.body;
  });
}

function search() {
  var url = urls.WORKSPACES;
  return request.get(url).then(function(res) {
    return res.body;
  });
}

exports.search = search;
exports.get = get;
