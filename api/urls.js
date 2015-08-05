/**
 * API URL utilities.
 * @module urls
 * @private
 */

var API = require('./config').API_URL;

/**
 * Join multiple URL parts with slashes.  Note that any trailing and preceeding
 * slashes will be removed from the parts before they are joined.
 * @return {string} The joined URL.
 */
function join() {
  return Array.prototype.map.call(arguments, function(part) {
    if (!(typeof part === 'string' || typeof part === 'number')) {
      throw new Error(
          'join must be called with strings or numbers, got: ' + part);
    }
    return String(part).replace(/^\/?(.*?)\/?$/, '$1');
  }).join('/');
}

exports.API = API;
exports.MOSAICS = join(API, 'mosaics', '');
exports.SCENES = join(API, 'scenes', '');
exports.WORKSPACES = join(API, 'workspaces', '');
exports.LOGIN = join(API, 'auth', 'login');

exports.join = join;
