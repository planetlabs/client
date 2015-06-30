/**
 * Provides methods getting scene metadata.
 * @module scenes
 */

var Page = require('./page');
var request = require('./request');
var urls = require('./urls');
var util = require('./util');

/**
 * Get metadata for a single scene.
 * @param {Object|string} scene An object with scene id and type properties.  If
 *     a string is provided, it is assumed to be the id, and the type will be
 *     set to 'ortho'.
 * @return {Promise.<Object>} A promise that resolves to scene metadata or is
 *     rejected with any error.
 */
function get(scene, options) {
  options = options || {};
  if (typeof scene === 'string') {
    scene = {
      id: scene,
      type: 'ortho'
    };
  }
  var url = urls.join(urls.SCENES, scene.type, scene.id);
  return request.get(url).then(function(obj) {
    if (options.augmentLinks !== false) {
      util.augmentSceneLinks(obj.data);
    }
    return obj.data;
  });
}

/**
 * Get a collection of scene metadata based on a query.
 * @param {Object} query A query object.
 * @return {Promise.<Page>} A promise that resolves to a page of scene
 *     metadata or is rejected with any error.
 */
function search(query, options) {
  options = options || {};
  var type;
  if (query.type) {
    type = query.type;
    delete query.type;
  } else {
    type = 'ortho';
  }

  var config = {
    url: urls.join(urls.SCENES, type, ''),
    query: query
  };
  return request.get(config).then(function(obj) {
    if (options.augmentLinks !== false) {
      var scenes = obj.data.features;
      for (var i = 0, ii = scenes.length; i < ii; ++i) {
        util.augmentSceneLinks(scenes[i]);
      }
    }
    return new Page(obj.data, search);
  });
}

exports.search = search;
exports.get = get;
