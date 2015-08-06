/* eslint-env mocha */
var assert = require('chai').assert;

var errors = require('../../api/errors');

describe('api/errors', function() {

  describe('ResponseError', function() {
    it('is a base class for response errors', function() {
      var message = 'foo';
      var response = {};
      var err = new errors.ResponseError(message, response);
      assert.equal(err.message, message);
      assert.equal(err.response, response);
      assert.instanceOf(err, Error);
    });
  });

  describe('BadRequest', function() {
    it('represents a 400 response', function() {
      var message = 'foo';
      var response = {};
      var err = new errors.BadRequest(message, response);
      assert.equal(err.message, message);
      assert.equal(err.response, response);
      assert.instanceOf(err, errors.ResponseError);
      assert.instanceOf(err, Error);
    });
  });

  describe('Unauthorized', function() {
    it('represents a 401 response', function() {
      var message = 'foo';
      var response = {};
      var err = new errors.Unauthorized(message, response);
      assert.equal(err.message, message);
      assert.equal(err.response, response);
      assert.instanceOf(err, errors.ResponseError);
      assert.instanceOf(err, Error);
    });
  });

  describe('Forbidden', function() {
    it('represents a 403 response', function() {
      var message = 'foo';
      var response = {};
      var err = new errors.Forbidden(message, response);
      assert.equal(err.message, message);
      assert.equal(err.response, response);
      assert.instanceOf(err, errors.ResponseError);
      assert.instanceOf(err, Error);
    });
  });

  describe('UnexpectedResponse', function() {
    it('represents a response that we do not expect', function() {
      var message = 'foo';
      var response = {};
      var err = new errors.UnexpectedResponse(message, response);
      assert.equal(err.message, message);
      assert.equal(err.response, response);
      assert.instanceOf(err, errors.ResponseError);
      assert.instanceOf(err, Error);
    });
  });

});

