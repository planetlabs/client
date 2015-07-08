/**
 * General utilities.
 * @module util
 * @private
 */

var url = require('url');

var authStore = require('./auth-store');

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
  var key = authStore.getKey();

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
exports.augmentSceneLinks = augmentSceneLinks;
exports.assign = assign;
