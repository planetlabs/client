/**
 * Provides methods getting scene metadata.
 * @module planet-client/api/scenes
 */

var Page = require('./page');
var request = require('./request');
var urls = require('./urls');

/**
 * Get metadata for a single scene.
 * @param {Object|string} scene An object with scene id and type properties.  If
 *     a string is provided, it is assumed to be the id, and the type will be
 *     set to 'ortho'.
 * @param {Object} options Options.
 * @param {function(function())} options.terminator A function that is called
 *     with a function that can be called back to terminate the request.
 * @return {Promise.<Object>} A promise that resolves to scene metadata or is
 *     rejected with any error.
 *     See the [`errors` module](#module:planet-client/api/errors) for a list of
 *     the possible error types.
 */
function get(scene, options) {
  options = options || {};
  if (typeof scene === 'string') {
    scene = {
      id: scene,
      type: 'ortho'
    };
  }
  var config = {
    url: urls.scenes(scene.type, scene.id),
    terminator: options.terminator
  };
  return request.get(config).then(function(res) {
    return res.body;
  });
}

/**
 * Get a collection of scene metadata based on a query.
 * @param {Object} query A query object.
 * @param {Object} options Options.
 * @param {function(function())} options.terminator A function that is called
 *     with a function that can be called back to terminate the request.
 * @return {Promise.<module:planet-client/api/page~Page>} A promise that
 *     resolves to a page of scene metadata or is rejected with any error.
 *     See the [`errors` module](#module:planet-client/api/errors) for a list of
 *     the possible error types.
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
    url: urls.scenes(type, ''),
    query: query,
    terminator: options.terminator
  };
  return request.get(config).then(function(res) {
    return new Page(res.body, search);
  });
}

exports.search = search;
exports.get = get;
