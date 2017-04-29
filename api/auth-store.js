/**
 * Memory store for API key and token.
 * @module api/auth-store
 * @private
 */

var decode = require('jwt-decode');

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
 * Set a token to be used for subsequent requests.
 * @param {string} token A JWT token.
 */
function setToken(token) {
  storage.token = token;
  var claims = decode(token);
  if (!claims.api_key) {
    throw new Error('Expected api_key in token payload');
  }
  storage.key = claims.api_key;
}

/**
 * Get any currently stored token.
 * @return {string} The stored token (if any).
 */
function getToken() {
  return storage.token;
}

/**
 * Clear any stored API key.
 */
function clear() {
  storage = {};
}

exports.setKey = setKey;
exports.getKey = getKey;
exports.setToken = setToken;
exports.getToken = getToken;
exports.clear = clear;
