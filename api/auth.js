/**
 * Provides methods for authenticating with a Planet API account.
 * Authentication is required when searching for imagery, and clients can
 * authenticate by either providing a valid email/password pair or an API
 * key.  Use the [`auth.login()`](#module:api/auth~login) method
 * with an email and password or the [`auth.setKey()`](#module:api/auth~setKey)
 * method with an API key.
 * @module api/auth
 */

var errors = require('./errors');
var request = require('./request');
var store = require('./auth-store');
var urls = require('./urls');

/**
 * Submit credentials for authentication.  Upon successful authentication, a
 * token representing the user will be stored for subsequent API requests.
 * @param {string} email The email associated with a Planet account.
 * @param {string} password The password for a Planet account.
 * @return {Promise} A promise that resolves on successful login and is rejected
 *     otherwise.
 */
function login(email, password) {
  var config = {
    url: urls.login(),
    body: {
      email: email,
      password: password
    },
    withCredentials: false
  };
  return request.post(config).then(function(obj) {
    if (!obj.body || !obj.body.token) {
      throw new errors.UnexpectedResponse(
        'Missing token',
        obj.response,
        obj.body
      );
    }
    var token = obj.body.token;
    try {
      store.setToken(token);
    } catch (err) {
      throw new errors.UnexpectedResponse(
        'Unable to decode token',
        obj.response,
        obj.body
      );
    }
    return token;
  });
}

/**
 * Clear any stored credentials.
 */
function logout() {
  store.clear();
}

/**
 * Set an API key to be used for subsequent requests.  This is an alternative
 * to submitting credentials with the [`login`](#module:api/auth~login)
 * method.  The stored key will be used for subsequent API requests.
 * @param {string} key An API key.
 */
function setKey(key) {
  store.setKey(key);
}

exports.login = login;
exports.logout = logout;
exports.setKey = setKey;
exports.getKey = store.getKey;
exports.setToken = store.setToken;
exports.getToken = store.getToken;
