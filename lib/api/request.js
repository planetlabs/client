var http = require('http');
var https = require('https');
var path = require('path');
var url = require('url');

var bole = require('bole');

var auth = require('./auth');
var errors = require('./errors');

var log = bole(path.basename(__filename, '.js'));

var defaultHeaders = {
  'accept': 'application/json'
};

/**
 * Generate request options provided a config object.
 * @param {Object} config A request config or URL.  The following config
 *     properties are supported:
 *      * url - Optional complete URL string.
 *      * method - Optional request method (default is 'GET').
 *      * query - Optional object to be serialized as the query string.  Any
 *        existing query string in the URL will be extended.
 *      * body - Optional object that will be serialized as JSON.
 *      * hostname - The hostname (e.g. example.com).  Will override any
 *        hostname in the URL if provided.
 *      * port - The port (e.g. '8000').  Default based on the protocol.  Will
 *        override any port in the URL if provided.
 *      * protocol - The protocol (e.g. 'https').  Will override any protocol
 *        in the URL if provided.
 *      * headers - Optional headers object.  By default JSON content-type and
 *        accept headers are set based on the context.  Any stored token will
 *        be added to an authorization header.
 *      * withCredentials - Determines whether XMLHttpRequest.withCredentials is
 *        set (`true` by default).
 * @return {Object} An options object to be passed to http.request() or
 *     https.request().
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
  }

  var apiKey = auth.getKey();
  if (apiKey && config.withCredentials !== false && !headers.authorization) {
    headers.authorization = 'api-key ' + apiKey;
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
 * @param {function(Object)} resolve Called on success with response and data
 *     properties.
 * @param {function(Error)} reject Called on failure.
 * @param {Object} info Request storage object with aborted and completed
 *     properties.  If info.stream is true, resolve will be called with the
 *     response stream.
 * @return {function(IncomingMessage)} A function that handles an http(s)
 *     incoming message.
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
        resolve(response);
      }
      return;
    }
    var body = '';
    response.on('data', function(chunk) {
      body += String(chunk);
    });

    response.on('error', function(err) {
      if (!info.aborted) {
        reject(err);
      }
    });

    response.on('end', function() {
      info.completed = true;
      var data = null;
      var err = null;
      if (!info.aborted) {
        if (body) {
          try {
            data = JSON.parse(body);
          } catch (parseErr) {
            err = new errors.UnexpectedResponse(
                'Trouble parsing response body as JSON: ' + body + '\n' +
                parseErr.stack + '\n', response, body);
          }
        }
        if (status === 401) {
          err = new errors.Unauthorized('Unauthorized', response, body);

        } else if (!(status >= 200 && status < 300)) {
          err = new errors.UnexpectedResponse('Unexpected response status: ' +
              status, response, body);
        }
        if (err) {
          reject(err);
          return;
        }
      }
      resolve({
        response: response,
        data: data
      });
    });
  };
}

/**
 * Issue an http(s) request.
 * @param {Object} config Request config.
 * @return {Promise<IncomingMessage>} A promise that resolves to a successful
 *     response.  Any non 200 status will result in a rejection.
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
 * @return {[type]} [description]
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
 * Simplified polyfill for ES6 Object.assign.
 * TODO: use 6to5 transform
 * @param {Object} target The target object.
 * @param {Object} src The source object(s).
 * @return {Object} The target object with source properties assigned.
 */
function assign(target, src) {
  for (var i = 1, ii = arguments.length; i < ii; ++i) {
    src = arguments[i];
    for (var key in src) {
      target[key] = src[key];
    }
  }
  return target;
}

exports.get = get;
exports.parseConfig = parseConfig;
exports.request = request;
