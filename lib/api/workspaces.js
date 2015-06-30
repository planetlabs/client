var request = require('./request');
var urls = require('./urls');

function get(id) {
  var url = urls.join(urls.WORKSPACES, id);
  return request.get(url).then(function(obj) {
    return obj.data;
  });
}

function search() {
  var url = urls.WORKSPACES;
  return request.get(url).then(function(obj) {
    return obj.data;
  });
}

exports.search = search;
exports.get = get;
