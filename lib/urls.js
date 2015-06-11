var API = require('./config').API_URL;

/**
 * Join multiple URL parts with slashes.  Note that any trailing and preceeding
 * slashes will be removed from the parts before they are joined.
 * @return {string} The joined URL.
 */
function join() {
  return Array.prototype.map.call(arguments, function(part) {
    return part.replace(/^\/?(.*?)\/?$/, '$1');
  }).join('/');
}

exports.SCENES = join(API, 'scenes', '');

exports.join = join;
