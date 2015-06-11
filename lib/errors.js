
/**
 * An error based on a server response.
 * @param {string} message Error message.
 * @param {XMLHttpRequest} response The response.
 * @constructor
 */
function ResponseError(message, response) {
  this.message = message;
  this.response = response;
  this.stack = (new Error()).stack;
}
ResponseError.prototype = new Error();
ResponseError.prototype.name = 'ResponseError';

/**
 * An error that occurs when the client is unathorized to make the request.
 * @param {string} message Error message.
 * @param {XMLHttpRequest} response The response.
 * @extends {ResponseError}
 * @constructor
 */
function Unauthorized(message, response) {
  ResponseError.apply(this, arguments);
}

Unauthorized.prototype = new ResponseError();
Unauthorized.prototype.name = 'Unauthorized';

/**
 * An error that occurs when invalid credentials are submitted to the login
 * endpoint.
 * @param {string} message Error message.
 * @param {XMLHttpRequest} response The response.
 * @extends {ResponseError}
 * @constructor
 */
function InvalidCredentials(message, response) {
  ResponseError.apply(this, arguments);
}

InvalidCredentials.prototype = new ResponseError();
InvalidCredentials.prototype.name = 'InvalidCredentials';

/**
 * An error that occurs the API returns an unexpected response.
 * @param {string} message Error message.
 * @param {XMLHttpRequest} response The response.
 * @extends {ResponseError}
 * @constructor
 */
function UnexpectedResponse(message, response) {
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
exports.InvalidCredentials = InvalidCredentials;
exports.UnexpectedResponse = UnexpectedResponse;
exports.AbortedRequest = AbortedRequest;
