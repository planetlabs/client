/**
 * Provides methods for setting API authentication credentials.
 * @module auth
 */

var storage = {};

/**
 * Set an API key to be used for subsequent requests.
 * @param {string} key An API key.
 */
function setKey(key) {
  storage.key = key;
}

/**
 * Get any currently stored API key.
 * @return {string} The stored API key (if any).
 */
function getKey() {
  return storage.key;
}

/**
 * Clear any stored API key.
 */
function clear() {
  storage = {};
}

exports.setKey = setKey;
exports.getKey = getKey;
exports.clear = clear;
