/**
 * General utilities.
 * @module util
 * @private
 */

var querystring = require('querystring');

var authStore = require('./auth-store');

function addQueryParams(link, params) {
  var baseHash = link.split('#');
  var base = baseHash[0];
  var hash = baseHash[1];

  var parts = base.split('?');
  var search = parts[1] || '';
  var query = querystring.parse(search);
  for (var name in params) {
    query[name] = params[name];
  }
  search = querystring.stringify(query);
  return parts[0] + '?' + search + (hash ? ('#' + hash) : '');
}

function augmentSceneLinks(scene) {
  var properties = scene.properties;
  var key = authStore.getKey();

  if (key) {
    var links = properties.links;
    links.full = addQueryParams(links.full, {'api_key': key});
    links.thumbnail = addQueryParams(links.thumbnail, {'api_key': key});
    links['square_thumbnail'] = addQueryParams(
        links['square_thumbnail'], {'api_key': key});

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

function augmentQuadLinks(quad) {
  var key = authStore.getKey();

  if (key) {
    var links = quad.properties.links;
    if (links.full) {
      links.full = addQueryParams(links.full, {'api_key': key});
    }
    if (links.thumbnail) {
      links.thumbnail = addQueryParams(links.thumbnail, {'api_key': key});
    }
  }

  return quad;
}

function augmentMosaicLinks(mosaic) {
  var key = authStore.getKey();

  if (key) {
    var links = mosaic.links;
    if (links.tiles) {
      links.tiles = addQueryParams(links.tiles, {'api_key': key});
    }
    if (links.quadmap) {
      links.quadmap = addQueryParams(links.quadmap, {'api_key': key});
    }
  }

  return mosaic;
}

/**
 * Simplified polyfill for ES6 Object.assign.
 * @param {Object} target The target object.
 * @param {Object} src The source object(s).
 * @return {Object} The target object with source properties assigned.
 * @private
 */
function assign(target, src) {
  for (var i = 1, ii = arguments.length; i < ii; ++i) {
    src = arguments[i];
    for (var key in src) {
      target[key] = src[key];
    }
  }
  return target;
}

exports.addQueryParams = addQueryParams;
exports.augmentMosaicLinks = augmentMosaicLinks;
exports.augmentQuadLinks = augmentQuadLinks;
exports.augmentSceneLinks = augmentSceneLinks;
exports.assign = assign;
