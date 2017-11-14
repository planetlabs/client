/**
 * General utilities.
 * @module api/util
 * @private
 */

var querystring = require('querystring');

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
  return parts[0] + '?' + search + (hash ? '#' + hash : '');
}

/**
 * Simplified polyfill for ES6 Object.assign.
 * @param {Object} target The target object.
 * @param {Object} src The source object(s).
 * @return {Object} The target object with source properties assigned.
 * @private
 */
function assign() {
  var target = arguments[0];
  for (var i = 1, ii = arguments.length; i < ii; ++i) {
    var src = arguments[i];
    for (var key in src) {
      target[key] = src[key];
    }
  }
  return target;
}

/**
 * Get the current location. More readily mocked than using the global
 * directly.
 *
 * @return {Location} The current location.
 */
function currentLocation() {
  /* location is tricky to mock in the browser */
  /* istanbul ignore if */
  if (typeof location !== 'undefined') {
    return location;
  } else {
    return undefined;
  }
}

exports.addQueryParams = addQueryParams;
exports.assign = assign;
exports.currentLocation = currentLocation;
