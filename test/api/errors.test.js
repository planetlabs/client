/* eslint-env jest */

var errors = require('../../api/errors');

describe('api/errors', function() {
  describe('ResponseError', function() {
    it('is a base class for response errors', function() {
      var message = 'foo';
      var response = {};
      var err = new errors.ResponseError(message, response);
      expect(err.message).toEqual(message);
      expect(err.response).toEqual(response);
      expect(err).toBeInstanceOf(Error);
    });
  });

  describe('BadRequest', function() {
    it('represents a 400 response', function() {
      var message = 'foo';
      var response = {};
      var err = new errors.BadRequest(message, response);
      expect(err.message).toEqual(message);
      expect(err.response).toEqual(response);
      expect(err).toBeInstanceOf(errors.ResponseError);
      expect(err).toBeInstanceOf(Error);
    });
  });

  describe('Unauthorized', function() {
    it('represents a 401 response', function() {
      var message = 'foo';
      var response = {};
      var err = new errors.Unauthorized(message, response);
      expect(err.message).toEqual(message);
      expect(err.response).toEqual(response);
      expect(err).toBeInstanceOf(errors.ResponseError);
      expect(err).toBeInstanceOf(Error);
    });
  });

  describe('Forbidden', function() {
    it('represents a 403 response', function() {
      var message = 'foo';
      var response = {};
      var err = new errors.Forbidden(message, response);
      expect(err.message).toEqual(message);
      expect(err.response).toEqual(response);
      expect(err).toBeInstanceOf(errors.ResponseError);
      expect(err).toBeInstanceOf(Error);
    });
  });

  describe('UnexpectedResponse', function() {
    it('represents a response that we do not expect', function() {
      var message = 'foo';
      var response = {};
      var err = new errors.UnexpectedResponse(message, response);
      expect(err.message).toEqual(message);
      expect(err.response).toEqual(response);
      expect(err).toBeInstanceOf(errors.ResponseError);
      expect(err).toBeInstanceOf(Error);
    });
  });
});
