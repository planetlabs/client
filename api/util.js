/**
 * General utilities.
 * @module api/util
 * @private
 */

const querystring = require('querystring');

function addQueryParams(link, params) {
  const baseHash = link.split('#');
  const base = baseHash[0];
  const hash = baseHash[1];

  const parts = base.split('?');
  let search = parts[1] || '';
  const query = querystring.parse(search);
  for (const name in params) {
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
  const target = arguments[0];
  for (let i = 1, ii = arguments.length; i < ii; ++i) {
    const src = arguments[i];
    for (const key in src) {
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
