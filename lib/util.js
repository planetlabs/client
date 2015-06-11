var url = require('url');

var auth = require('./auth');

function addQueryParams(link, params) {
  var parsed = url.parse(link, true);
  delete parsed.search;
  if (!parsed.query) {
    parsed.query = {};
  }
  for (var name in params) {
    parsed.query[name] = params[name];
  }
  return url.format(parsed);
}

function augmentSceneLinks(scene) {
  var properties = scene.properties;
  var key = auth.getKey();

  if (key) {
    var links = properties.links;
    links.full = addQueryParams(links.full, {'api_key': key});
    links.thumbnail = addQueryParams(links.thumbnail, {'api_key': key});
    links['square_thumbnail'] = addQueryParams(links['square_thumbnail'], {'api_key': key});

    var products = properties.data.products;
    for (var type in products) {
      var product = products[type];
      for (var format in product) {
        product[format] = addQueryParams(product[format], {'api_key': key});
      }
    }
  }

  return scene;
}

exports.augmentSceneLinks = augmentSceneLinks;
