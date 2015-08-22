/**
 * API URL utilities.
 * @module planet-client/api/urls
 * @private
 */

var config = require('./config');

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
          'join must be called with strings or numbers, got: ' + part);
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

function rootUrl() {
  var baseComponents = Array.prototype.slice.call(arguments);
  return function() {
    return join.apply(null,
      [config.API_URL]
      .concat(baseComponents)
      .concat(Array.prototype.slice.call(arguments))
    );
  };
}

exports.api = rootUrl();
exports.mosaics = rootUrl('mosaics', '');
exports.scenes = rootUrl('scenes', '');
exports.workspaces = rootUrl('workspaces', '');
exports.login = rootUrl('auth', 'login');

exports.join = join;
