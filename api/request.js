/**
 * Provides methods for issuing API requests.
 * @module api/request
 * @private
 */

const url = require('url');
const assign = require('./util').assign;
const util = require('./util');
const authStore = require('./auth-store');
const errors = require('./errors');
const promiseWithRetry = require('./retry');

const defaultHeaders = {
  accept: 'application/json',
};

/**
 * Generate request options provided a config object.
 * @param {Object} config A request config.
 * @return {Object} An object with method, headers, url, and withCredentials
 * properties.
 * @private
 */
function parseConfig(config) {
  let base;

  if (config.url) {
    let resolved;
    const currentLocation = util.currentLocation();

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
      query: assign(base.query, config.query),
    });
  }
  config = assign(base, config);

  const headers = assign({}, defaultHeaders);
  for (const key in config.headers) {
    headers[key.toLowerCase()] = config.headers[key];
  }
  if (!config.form && config.body) {
    headers['content-type'] = 'application/json';
  }

  if (config.withCredentials !== false) {
    const token = authStore.getToken();
    const apiKey = authStore.getKey();
    if (token) {
      headers.authorization = 'Bearer ' + token;
    } else if (apiKey) {
      headers.authorization = 'api-key ' + apiKey;
    }
  }

  const options = {
    method: config.method || 'GET',
    headers: headers,
    url:
      config.protocol +
      '//' +
      config.hostname +
      (config.port ? ':' + config.port : '') +
      config.path,
  };

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
  let err = null;
  const status = response.status;
  if (status === 400) {
    err = new errors.BadRequest('Bad request', response, body);
  } else if (status === 401) {
    err = new errors.Unauthorized('Unauthorized', response, body);
  } else if (status === 403) {
    err = new errors.Forbidden('Forbidden', response, body);
  } else if (!(status >= 200 && status < 300)) {
    err = new errors.UnexpectedResponse(
      'Unexpected response status: ' + status,
      response
    );
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
 * @return {function(XMLHttpRequest)} A function that handles an http(s)
 *     incoming message.
 * @private
 */
function createResponseHandler(resolve, reject, info) {
  return function (event) {
    let client = event.target;

    if (client.status === 302) {
      const redirectLocation = client.getResponseHeader('Location');
      client = new XMLHttpRequest();
      client.addEventListener(
        'load',
        createResponseHandler(resolve, reject, info)
      );
      client.addEventListener('error', function () {
        reject(new errors.ClientError('Request failed'));
      });
      client.open('GET', redirectLocation);
      return;
    }

    info.completed = true;
    if (info.aborted) {
      return;
    }
    let body = null;
    let err = null;
    const data = client.responseText;
    if (data) {
      try {
        body = JSON.parse(data);
      } catch (parseErr) {
        err = new errors.UnexpectedResponse(
          'Trouble parsing response body as JSON: ' +
            data +
            '\n' +
            parseErr.stack +
            '\n',
          client,
          data
        );
      }
    }

    err = errorCheck(client, body) || err;

    if (err) {
      reject(err);
    } else {
      resolve({
        response: client,
        body: body,
      });
    }
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
 * @param {Object} config.form - Optional form data that will be used as the
 *     request body.  This will override the `body` option.
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
 * @param {number} config.retries - Number of retries for 429 or 5xx responses.
 *     By default, the request will be attempted 10 times with exponential backoff.
 * @return {Promise<Object>} A promise that resolves on a successful
 *     response.  The object includes response and body properties, where the
 *     body is a JSON decoded object representing the response body.  Any
 *     non-200 status will result in a rejection.
 */
function request(config) {
  const options = parseConfig(config);

  const retries = 'retries' in config ? config.retries : 10;

  const info = {
    aborted: false,
    completed: false,
  };

  return promiseWithRetry(retries, function (resolve, reject) {
    const client = new XMLHttpRequest();
    const handler = createResponseHandler(resolve, reject, info);

    client.addEventListener('load', handler);

    client.addEventListener('error', function () {
      reject(new errors.ClientError('Request failed'));
    });

    let body = null;
    if (config.form) {
      body = config.form;
    } else if (config.body) {
      body = JSON.stringify(config.body);
    }

    try {
      // Old Firefox throws NetworkError instead of firing the 'error' event
      client.open(options.method, options.url);
      for (const header in options.headers) {
        client.setRequestHeader(header, options.headers[header]);
      }
      if ('withCredentials' in options) {
        client.withCredentials = options.withCredentials;
      }
      client.send(body);
    } catch (err) {
      reject(new errors.ClientError('Request failed: ' + err.message));
      return;
    }

    if (config.terminator) {
      config.terminator(function () {
        if (!info.completed && !info.aborted) {
          info.aborted = true;
          client.abort();
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
      method: 'GET',
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
 * @param {string|Object} config A URL or request config.
 * @return {Promise<Object>} A promise that resolves on a successful
 *     response.  The object includes response and body properties, where the
 *     body is a JSON decoded object representing the response body.  Any
 *     non-200 status will result in a rejection.
 */
function del(config) {
  if (typeof config === 'string') {
    config = {
      url: config,
    };
  }
  return request(assign({method: 'DELETE'}, config));
}

exports.get = get;
exports.post = post;
exports.put = put;
exports.del = del;
exports.parseConfig = parseConfig;
exports.request = request;
