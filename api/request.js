/**
 * Provides methods for issuing API requests.
 * @module requests
 * @private
 */

var http = require('http');
var https = require('https');
var path = require('path');
var url = require('url');

var bole = require('bole');

var assign = require('./util').assign;
var authStore = require('./auth-store');
var errors = require('./errors');

var log = bole(path.basename(__filename, '.js'));

var defaultHeaders = {
  'accept': 'application/json'
};

/**
 * Generate request options provided a config object.
 * @param {Object} config A request config.
 * @return {Promise<IncomingMessage>} A promise that resolves to a successful
 *     response.  Any non 200 status will result in a rejection.
 * @private
 */
function parseConfig(config) {
  var base = config.url ? url.parse(config.url, true) : {};
  if (config.query) {
    config.path = url.format({
      pathname: base.pathname || '/',
      query: assign(base.query, config.query)
    });
  }
  config = assign(base, config);

  // TODO: fix default port handling in http-browserify
  var defaultPort;
  if (config.protocol && config.protocol.indexOf('https') === 0) {
    defaultPort = '443';
  } else {
    defaultPort = '80';
  }

  var headers = assign({}, defaultHeaders);
  for (var key in config.headers) {
    headers[key.toLowerCase()] = config.headers[key];
  }
  if (config.body) {
    headers['content-type'] = 'application/json';
    headers['content-length'] = JSON.stringify(config.body).length;
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
    port: config.port || defaultPort,
    method: config.method || 'GET',
    path: config.path,
    headers: headers
  };

  if ('withCredentials' in config) {
    options.withCredentials = config.withCredentials;
  }
  return options;
}

/**
 * Create a handler for JSON API responses.
 * @param {function(Object)} resolve Called on success with response and body
 *     properties.
 * @param {function(Error)} reject Called on failure.
 * @param {Object} info Request storage object with aborted and completed
 *     properties.  If info.stream is true, resolve will be called with the
 *     response stream.
 * @return {function(IncomingMessage)} A function that handles an http(s)
 *     incoming message.
 * @private
 */
function createResponseHandler(resolve, reject, info) {
  return function(response) {
    var status = response.statusCode;
    if (status === 302) {
      log.debug('Following redirect: ', response.headers.location);
      https.get(response.headers.location,
          createResponseHandler(resolve, reject, info));
      return;
    }
    if (info.stream) {
      if (!(status >= 200 && status < 300)) {
        reject(new errors.UnexpectedResponse('Unexpected response status: ' +
            status, response));
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
      if (status === 401) {
        err = new errors.Unauthorized('Unauthorized', response, body);
      } else if (!(status >= 200 && status < 300)) {
        err = new errors.UnexpectedResponse('Unexpected response status: ' +
            status, response, data);
      } else if (data) {
        try {
          body = JSON.parse(data);
        } catch (parseErr) {
          err = new errors.UnexpectedResponse(
              'Trouble parsing response body as JSON: ' + data + '\n' +
              parseErr.stack + '\n', response, data);
        }
      }
      if (err) {
        reject(err);
        return;
      }
      resolve({
        response: response,
        body: body
      });
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
 * @return {Promise<Object>} A promise that resolves on a successful
 *     response.  The object includes response and body properties, where the
 *     body is a JSON decoded object representing the response body.  Any
 *     non-200 status will result in a rejection.
 */
function request(config) {
  var options = parseConfig(config);

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
    stream: config.stream
  };

  return new Promise(function(resolve, reject) {
    var handler = createResponseHandler(resolve, reject, info);
    var client = protocol.request(options, handler);
    if (config.body) {
      client.write(JSON.stringify(config.body));
    }
    client.end();

    if (config.terminator) {
      config.terminator(function() {
        if (!info.aborted && !info.completed) {

          info.aborted = true;
          if (client.abort) {
            client.abort();
          } else if (client.xhr && client.xhr.abort) {
            // TODO: file a http-browserify issue for lack of abort
            client.xhr.abort();
          }

          reject(new errors.AbortedRequest('Request aborted'));
        }
      });
    }
  });
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

exports.get = get;
exports.post = post;
exports.parseConfig = parseConfig;
exports.request = request;
