var fs = require('fs');
var path = require('path');

var homedir = require('os-homedir');
var prompt = require('prompt');

var auth = require('../api/auth');
var authStore = require('../api/auth-store');

var file = path.join(homedir(), '.planet');

/**
 * Options for the find-scenes command.
 * @type {Object}
 */
var options = {
  email: {
    alias: 'e',
    description: 'Account email'
  },
  password: {
    alias: 'p',
    description: 'Account password'
  }
};

function assertConfigNotFound() {
  return new Promise(function(resolve, reject) {
    fs.exists(file, function(exists) {
      if (exists) {
        reject(new Error('Planet config file already exists: ' + file));
      } else {
        resolve();
      }
    });
  });
}

function promptForMissing(opts) {
  var schema = {
    properties: {
      email: {
        message: options.email.description,
        required: true
      },
      password: {
        message: options.password.description,
        required: true,
        hidden: true
      }
    }
  };
  return new Promise(function(resolve, reject) {
    prompt.override = opts;
    prompt.message = '';
    prompt.delimiter = '';
    prompt.start();
    prompt.get(schema, function(err, result) {
      if (err) {
        reject(err);
        return;
      }
      opts.email = result.email;
      opts.password = result.password;
      resolve(opts);
    });
  });
}

function writeKey(key) {
  return new Promise(function(resolve, reject) {
    fs.writeFile(file, key, {flag: 'wx'}, function(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

/**
 * Gather credentials and persist an API key.
 * @param {Object} opts The CLI options for the command.
 * @return {Promise} A promise that resolves on successful initialization.
 */
function main(opts) {
  return assertConfigNotFound().then(function() {
      return promptForMissing(opts);
    }).then(function(fullOpts) {
      return auth.login(fullOpts.email, fullOpts.password);
    }).then(function() {
      return writeKey(authStore.getKey());
    });
}

exports.description = 'Initialize the Planet CLI';
exports.main = main;
exports.optionalKey = true;
exports.options = options;
