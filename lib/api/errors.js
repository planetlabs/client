
/**
 * An error based on a server response.
 * @param {string} message Error message.
 * @param {XMLHttpRequest} response The response.
 * @param {string} body Any parsed response body.
 * @constructor
 */
function ResponseError(message, response, body) {
  this.message = message;
  this.response = response;
  this.body = body;
  this.stack = (new Error()).stack;
}
ResponseError.prototype = new Error();
ResponseError.prototype.name = 'ResponseError';

/**
 * An error that occurs when the client is unathorized to make the request.
 * @param {string} message Error message.
 * @param {XMLHttpRequest} response The response.
 * @param {string} body Any parsed response body.
 * @extends {ResponseError}
 * @constructor
 */
function Unauthorized(message, response, body) {
  ResponseError.apply(this, arguments);
}

Unauthorized.prototype = new ResponseError();
Unauthorized.prototype.name = 'Unauthorized';

/**
 * An error that occurs the API returns an unexpected response.
 * @param {string} message Error message.
 * @param {XMLHttpRequest} response The response.
 * @param {string} body Any parsed response body.
 * @extends {ResponseError}
 * @constructor
 */
function UnexpectedResponse(message, response, body) {
  ResponseError.apply(this, arguments);
}

UnexpectedResponse.prototype = new ResponseError();
UnexpectedResponse.prototype.name = 'UnexpectedResponse';

/**
 * An error generated when the request is aborted.
 * @param {string} message Error message.
 * @constructor
 */
function AbortedRequest(message) {
  this.message = message;
  this.stack = (new Error()).stack;
}
AbortedRequest.prototype = new Error();
AbortedRequest.prototype.name = 'AbortedRequest';

exports.ResponseError = ResponseError;
exports.Unauthorized = Unauthorized;
exports.UnexpectedResponse = UnexpectedResponse;
exports.AbortedRequest = AbortedRequest;
