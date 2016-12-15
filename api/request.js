/**
 * Provides methods for issuing API requests.
 * @module planet-client/api/request
 * @private
 */

var http = require('http');
var https = require('https');
var path = require('path');
var url = require('url');

var bole = require('bole');

var assign = require('./util').assign;
var util = require('./util');
var authStore = require('./auth-store');
var errors = require('./errors');

var log = bole(path.basename(__filename, '.js'));

var defaultHeaders = {
  'accept': 'application/json'
};

var boundary = generateBoundary();

/**
 * Generate request options provided a config object.
 * @param {Object} config A request config.
 * @return {Object} Options for the request function.
 * @private
 */
function parseConfig(config) {
  var base;

  if (config.url) {
    var resolved;
    var currentLocation = util.currentLocation();

    if (typeof currentLocation !== 'undefined') {
      resolved = url.resolve(currentLocation.href, config.url);
    } else {
      resolved = config.url;
    }
    base = url.parse(resolved, true);
  } else {
    base = {query: {}};
  }
  if (config.query) {
    config.path = url.format({
      pathname: base.pathname || config.pathname || '/',
      query: assign(base.query, config.query)
    });
  }
  config = assign(base, config);

  var headers = assign({}, defaultHeaders);
  for (var key in config.headers) {
    headers[key.toLowerCase()] = config.headers[key];
  }
  if (config.body) {
    headers['content-type'] = 'application/json';
    headers['content-length'] = JSON.stringify(config.body).length;
  }
  if (config.file) {
    headers['content-type'] = 'multipart/form-data; boundary=' + boundary;
    headers['content-length'] = byteCount(toMultipartUpload(config.file));
  }

  if (config.withCredentials !== false) {
    var token = authStore.getToken();
    var apiKey = authStore.getKey();
    if (token) {
      headers.authorization = 'Bearer ' + token;
    } else if (apiKey) {
      headers.authorization = 'api-key ' + apiKey;
    }
  }

  var options = {
    protocol: config.protocol,
    hostname: config.hostname,
    method: config.method || 'GET',
    path: config.path,
    headers: headers
  };

  if (config.port) {
    options.port = config.port;
  }

  if ('withCredentials' in config) {
    options.withCredentials = config.withCredentials;
  }
  return options;
}

/**
 * Check if the response represents an error.
 * @param {IncomingMessage} response The response.
 * @param {Object} body Any parsed body (as JSON).
 * @return {errors.ResponseError} A response error (or null if none).
 */
function errorCheck(response, body) {
  var err = null;
  var status = response.statusCode;
  if (status === 400) {
    err = new errors.BadRequest('Bad request', response, body);
  } else if (status === 401) {
    err = new errors.Unauthorized('Unauthorized', response, body);
  } else if (status === 403) {
    err = new errors.Forbidden('Forbidden', response, body);
  } else if (!(status >= 200 && status < 300)) {
    err = new errors.UnexpectedResponse('Unexpected response status: ' +
        status, response);
  }
  return err;
}

/**
 * Create a handler for JSON API responses.
 * @param {function(Object)} resolve Called on success with response and body
 *     properties.
 * @param {function(Error)} reject Called on failure.
 * @param {Object} info Request storage object with aborted and completed
 *     properties.  If info.stream is true, resolve will be called with the
 *     response stream.
 * @param {function(Promise)} makeRequest Function that creates a promise for
 *     a response.
 * @return {function(IncomingMessage)} A function that handles an http(s)
 *     incoming message.
 * @private
 */
function createResponseHandler(resolve, reject, info, makeRequest) {
  return function(response) {
    var status = response.statusCode;
    if (status === 302) {
      log.debug('Following redirect: ', response.headers.location);
      https.get(response.headers.location,
          createResponseHandler(resolve, reject, info));
      return;
    }

    if (info.stream) {
      var streamErr = errorCheck(response, null);
      if (streamErr) {
        reject(streamErr);
      } else {
        resolve({response: response, body: null});
      }
      return;
    }

    var data = '';
    response.on('data', function(chunk) {
      data += String(chunk);
    });

    response.on('error', function(err) {
      if (!info.aborted) {
        reject(err);
      }
    });

    response.on('end', function() {
      info.completed = true;
      if (info.aborted) {
        return;
      }
      var body = null;
      var err = null;
      if (data) {
        try {
          body = JSON.parse(data);
        } catch (parseErr) {
          err = new errors.UnexpectedResponse(
              'Trouble parsing response body as JSON: ' + data + '\n' +
              parseErr.stack + '\n', response, data);
        }
      }

      err = errorCheck(response, body) || err;

      if (err) {
        if (info.retries && err instanceof errors.UnexpectedResponse) {
          --info.retries;
          makeRequest().then(resolve).catch(reject);
        } else {
          reject(err);
        }
      } else {
        resolve({
          response: response,
          body: body
        });
      }
    });
  };
}

/**
 * Issue an http(s) request.
 * @param {Object} config Request config.
 * @param {string} config.url - Optional complete URL string.
 * @param {string} config.method - Optional request method (default is 'GET').
 * @param {Object} config.query - Optional object to be serialized as the query
 *     string.  Any existing query string in the URL will be extended.
 * @param {Object} config.body - Optional object that will be serialized as
 *     JSON.
 * @param {string} config.hostname - The hostname (e.g. example.com).  Will
 *     override any hostname in the URL if provided.
 * @param {string} config.port - The port (e.g. '8000').  Default based on the
 *     protocol.  Will override any port in the URL if provided.
 * @param {string} config.protocol - The protocol (e.g. 'https').  Will override
 *     any protocol in the URL if provided.
 * @param {Object} config.headers - Optional headers object.  By default JSON
 *     content-type and accept headers are set based on the context.  Any stored
 *     token will be added to an authorization header.
 * @param {boolean} config.withCredentials - Determines whether
 *     `XMLHttpRequest.withCredentials` is set (`true` by default).
 * @param {number} config.retries - Number of retries (`0` by default).
 * @return {Promise<Object>} A promise that resolves on a successful
 *     response.  The object includes response and body properties, where the
 *     body is a JSON decoded object representing the response body.  Any
 *     non-200 status will result in a rejection.
 */
function request(config) {
  var options = parseConfig(config);
  var retries = Number(config.retries) || 0;

  var protocol;
  if (options.protocol && options.protocol.indexOf('https') === 0) {
    protocol = https;
  } else {
    protocol = http;
  }
  log.debug('request options: %j', options);

  var info = {
    aborted: false,
    completed: false,
    stream: config.stream,
    retries: retries
  };

  function makeRequest() {
    return new Promise(function(resolve, reject) {
      var handler = createResponseHandler(resolve, reject, info, makeRequest);
      var client = protocol.request(options, handler);
      client.on('error', function(err) {
        reject(new errors.ClientError(err.message));
      });
      if (config.body) {
        client.write(JSON.stringify(config.body));
      }
      if (config.file) {
        client.write(toMultipartUpload(config.file));
      }
      client.end();

      if (config.terminator) {
        config.terminator(function() {
          if (!info.aborted && !info.completed) {
            info.aborted = true;
            reject(new errors.AbortedRequest('Request aborted'));
          }
        });
      }
    });
  }
  return makeRequest();
}

/**
 * Issue a GET request.
 * @param {string|Object} config A URL or request config.
 * @param {string} config.url A URL or request config.
 * @return {Promise<Object>} A promise that resolves on a successful
 *     response.  The object includes response and body properties, where the
 *     body is a JSON decoded object representing the response body.  Any
 *     non-200 status will result in a rejection.
 */
function get(config) {
  if (typeof config === 'string') {
    config = {
      url: config,
      method: 'GET'
    };
  }
  return request(config);
}

/**
 * Issue a POST request.
 * @param {Object} config The request config.
 * @return {Promise<Object>} A promise that resolves on a successful
 *     response.  The object includes response and body properties, where the
 *     body is a JSON decoded object representing the response body.  Any
 *     non-200 status will result in a rejection.
 */
function post(config) {
  return request(assign({method: 'POST'}, config));
}

/**
 * Issue a PUT request.
 * @param {Object} config The request config.
 * @return {Promise<Object>} A promise that resolves on a successful
 *     response.  The object includes response and body properties, where the
 *     body is a JSON decoded object representing the response body.  Any
 *     non-200 status will result in a rejection.
 */
function put(config) {
  return request(assign({method: 'PUT'}, config));
}

/**
 * Issue a DELETE request.
 * @param {Object} config The request config.
 * @return {Promise<Object>} A promise that resolves on a successful
 *     response.  The object includes response and body properties, where the
 *     body is a JSON decoded object representing the response body.  Any
 *     non-200 status will result in a rejection.
 */
function del(config) {
  return request(assign({method: 'DELETE'}, config));
}

/**
 * Converts a file object to a multipart payload. The file is assumed to have
 * textual content and to conform to the
 * [File](https://developer.mozilla.org/en-US/docs/Web/API/File) interface.
 *
 * Note: this isn't binary-safe.
 *
 * @param {File} file A File-like object conforming to the HTML File api.
 * @return {String} A multipart request body for a file upload.
 */
function toMultipartUpload(file) {
  return [
    '--' + boundary,
    '\r\n',
    'Content-Type: application/json; charset=utf-8',
    '\r\n',
    'Content-Disposition: form-data; name="file"; filename="' + file.name + '"',
    '\r\n\r\n',
    file.contents,
    '\r\n',
    '--' + boundary + '--'
  ].join('');
}

/**
 * Returns the length in bytes of a string.
 * @param {String} source A string whose length we wish to count.
 * @return {Number} The byte-length of a string
 */
function byteCount(source) {
  return encodeURI(source).split(/%..|./).length - 1;
}

/**
 * Returns a boundary, generating a new one and memoizing it if necessary.
 *
 * @return {String} A 24 character hex string string to use as a multipart
 *   boundary.
 */
function generateBoundary() {
  var newBoundary = [];
  for (var i = 0; i < 24; i++) {
    newBoundary.push(Math.floor(Math.random() * 16).toString(16));
  }
  return newBoundary.join('');
}

exports.get = get;
exports.post = post;
exports.put = put;
exports.del = del;
exports.parseConfig = parseConfig;
exports.request = request;
