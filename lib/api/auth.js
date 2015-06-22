var storage = {};

/**
 * Set an API key to be used for subsequent requests.
 * @param {string} key An API key.
 */
exports.setKey = function(key) {
  storage.key = key;
};

/**
 * Get any currently stored API key.
 * @return {string} The stored API key (if any).
 */
exports.getKey = function() {
  return storage.key;
};

/**
 * Clear any stored API key.
 */
exports.clear = function() {
  storage = {};
};
