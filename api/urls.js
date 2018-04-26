/**
 * API URL utilities.
 * @module api/urls
 * @private
 */

var API_URL = 'https://api.planet.com/';
exports.setBase = function(base) {
  API_URL = base;
};

/**
 * Join multiple URL parts with slashes.  Note that any trailing and preceeding
 * slashes will be removed from the parts before they are joined.
 * A single trailing slash can forced by an empty string as the final vararg.
 * @return {string} The joined URL.
 */
function join() {
  var components = Array.prototype.map.call(arguments, function(part) {
    if (!(typeof part === 'string' || typeof part === 'number')) {
      throw new Error(
        'join must be called with strings or numbers, got: ' + part
      );
    }
    return String(part).replace(/^\/?(.*?)\/?$/, '$1');
  });

  // Preserve trailing slashes but remove every other interstitial.
  var lastComponent = components.pop();
  return components
    .filter(function(el) {
      return el !== '';
    })
    .concat(lastComponent)
    .join('/');
}

function getter() {
  var parts = Array.prototype.slice.call(arguments);
  return function() {
    return join.apply(
      null,
      [API_URL].concat(parts).concat(Array.prototype.slice.call(arguments))
    );
  };
}

exports.base = getter('');
exports.login = getter(
  'auth',
  'v1',
  'experimental',
  'public',
  'users',
  'authenticate'
);
exports.types = getter('data', 'v1', 'item-types', '');
exports.items = function(type) {
  var rest = Array.prototype.slice.call(arguments, 1);
  var get = getter('data', 'v1', 'item-types', type, 'items', '');
  return get.apply(null, rest);
};
exports.quickSearch = getter('data', 'v1', 'quick-search');
exports.searches = getter('data', 'v1', 'searches', '');
exports.join = join;
