/**
 * Provides methods for listing and creating aois.
 * @module planet-client/api/aois
 */

var request = require('./request');
var urls = require('./urls');

/**
 * Get metadata for a single uploaded aoi.
 * @param {string} id A mosaic identifier.
 * @param {Object} options Options.
 * @param {function(function())} options.terminator A function that is called
 *     with a function that can be called back to terminate the request.
 * @return {Promise.<Object>} A promise that resolves to aoi metadata or is
 *     rejected with any error.  See the [`errors`
 *     module](#module:planet-client/api/errors) for a list of the possible
 *     error types.
 */
function get(id, options) {
  options = options || {};
  var config = {
    url: urls.aois(id),
    terminator: options.terminator
  };
  return request.get(config).then(function(res) {
    return res.body;
  });
}

/**
 * List all of your previously uploaded aois.
 * @param {string} id An aoi public id.
 * @param {Object} options Options.
 * @param {function(function())} options.terminator A function that is called
 *     with a function that can be called back to terminate the request.
 * @return {Promise.<Object[]>} A promise that resolves to an array of aoi
 *     metadata or is rejected with any error.  See the [`errors` module]
 *     (#module:planet-client/api/errors) for a list of the possible error
 *     types.
 */
function list(id, options) {
  options = options || {};
  var config = {
    url: urls.aois(),
    terminator: options.terminator
  };
  return request.get(config).then(function(res) {
    return res.body;
  });
}

/**
 * Creates a new aoi using uploaded json data.
 * @param {String} name The name of the aoi.
 * @param {Object} file A custom object representing a file and it's contents.
 * @param {String} file.name The name of the originally uploaded file.
 * @param {String} file.contents The file's contents as a string.
 * @param {Object} options Options.
 * @param {function(function())} options.terminator A function that is called
 *     with a function that can be called back to terminate the request.
 * @return {Promise.<Object[]>} A promise that resolves to an array of aoi
 *     metadata or is rejected with any error.  See the [`errors` module]
 *     (#module:planet-client/api/errors) for a list of the possible error
 *     types.
 */
function create(name, file, options) {
  options = options || {};
  var config = {
    url: urls.aois(),
    query: {
      name: name
    },
    file: file,
    terminator: options.terminator
  };
  return request.post(config).then(function(res) {
    return res.body;
  });
}

/**
 * Gets the contents of an AOI as geojson.
 * @param {String} id The public id of the aoi.
 * @param {Object} options Options.
 * @param {function(function())} options.terminator A function that is called
 *     with a function that can be called back to terminate the request.
 * @return {Promise.<String>} A promise that resolves to the geojson contents
 * of the aoi.
 */
function download(id, options) {
  options = options || {};
  var config = {
    url: urls.aois(id, 'download'),
    terminator: options.terminator
  };
  return request.get(config).then(function(res) {
    return res.body;
  });

}

exports.get = get;
exports.list = list;
exports.create = create;
exports.download = download;
