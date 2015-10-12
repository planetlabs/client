/**
 * Provides methods for listing and creating areas of interest (AOI), or stored
 * geometries. AOIs allow you to query the scenes api without having to
 * transmit what may be very large geometries with every request.
 *
 * After creating an AOI, we'll respond with a `json` payload containing an
 * `id` as well as the resulting `geojson`. The scenes api can then be queried
 * using the `aoi` parameter and setting it to the id of your uploaded AOI.
 *
 * @module planet-client/api/aois
 */

var request = require('./request');
var urls = require('./urls');

/**
 * Obtains the metadata for a single uploaded geometry. The response includes
 * the geometry inside the returned object's `geojson` field.
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
 * List all of your previously uploaded AOIs. Note that this does not include
 * the geometry geojson for each AOI.
 * @param {string} id An AOI public id.
 * @param {Object} options Options.
 * @param {function(function())} options.terminator A function that is called
 *     with a function that can be called back to terminate the request.
 * @return {Promise.<Object[]>} A promise that resolves to an array of AOI
 *     metadata or is rejected with any error.  See the [`errors`
 *     module](#module:planet-client/api/errors) for a list of the possible
 *     error types.
 * @see {@link get} to obtain an individual AOI's GeoJSON and metadata.
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
 * Creates a new AOI using uploaded json data.
 * @param {String} name The name of the AOI.
 * @param {Object} file An object representing a file and it's contents.
 * @param {String} file.name The name of the originally uploaded file.
 * @param {String} file.contents The file's contents as a string.
 * @param {Object} options Options.
 * @param {function(function())} options.terminator A function that is called
 *     with a function that can be called back to terminate the request.
 * @return {Promise.<Object[]>} A promise that resolves to an array of AOI
 *     metadata or is rejected with any error.  See the [`errors`
 *     module](#module:planet-client/api/errors) for a list of the possible
 *     error types.
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

exports.get = get;
exports.list = list;
exports.create = create;
