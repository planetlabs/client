/* eslint-env mocha */
var assert = require('chai').assert;

var errors = require('../../lib/errors');

describe('errors', function() {

  describe('ResponseError', function() {
    it('is a generic response error', function() {
      var message = 'foo';
      var response = {};
      var err = new errors.ResponseError(message, response);
      assert.equal(err.message, message);
      assert.equal(err.response, response);
      assert.instanceOf(err, Error);
    });
  });

  describe('Unauthorized', function() {
    it('represents an unauthorized request', function() {
      var message = 'foo';
      var response = {};
      var err = new errors.Unauthorized(message, response);
      assert.equal(err.message, message);
      assert.equal(err.response, response);
      assert.instanceOf(err, errors.ResponseError);
      assert.instanceOf(err, Error);
    });
  });

  describe('InvalidCredentials', function() {
    it('represents authentication with bad credentials', function() {
      var message = 'foo';
      var response = {};
      var err = new errors.InvalidCredentials(message, response);
      assert.equal(err.message, message);
      assert.equal(err.response, response);
      assert.instanceOf(err, errors.ResponseError);
      assert.instanceOf(err, Error);
    });
  });

  describe('UnexpectedResponse', function() {
    it('represents authentication with bad credentials', function() {
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

