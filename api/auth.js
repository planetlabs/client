/**
 * Provides methods for setting API authentication credentials.
 * @module auth
 */

var errors = require('./errors');
var request = require('./request');
var store = require('./auth-store');
var urls = require('./urls');

/**
 * Submit credentials for authentication.
 * @param {string} email Email.
 * @param {string} password Password.
 * @return {Promise} A promise that resolves on successful login and is rejected
 *     otherwise.
 */
function login(email, password) {
  var config = {
    url: urls.LOGIN,
    body: {
      email: email,
      password: password
    },
    withCredentials: false
  };
  return request.post(config).then(function(obj) {
    if (!obj.body || !obj.body.token) {
      throw new errors.UnexpectedResponse(
          'Missing token', obj.response, obj.body);
    }
    try {
      store.setToken(obj.body.token);
    } catch (err) {
      throw new errors.UnexpectedResponse(
          'Unable to decode token', obj.response, obj.body);
    }
    return true;
  });
}

/**
 * Clear any stored credentials.
 */
function logout() {
  store.clear();
}

/**
 * Set an API key to be used for subsequent requests.
 * @param {string} key An API key.
 */
function setKey(key) {
  store.setKey(key);
}

exports.login = login;
exports.logout = logout;
exports.setKey = setKey;
