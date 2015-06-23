var request = require('./request');
var urls = require('./urls');

function get(id) {
  var url = urls.join(urls.WORKSPACES, id);
  return request.get(url).then(function(obj) {
    return obj.data;
  });
}

function find() {
  var url = urls.WORKSPACES;
  return request.get(url).then(function(obj) {
    return obj.data;
  });
}

exports.find = find;
exports.get = get;
