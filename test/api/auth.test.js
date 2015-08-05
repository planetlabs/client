/* eslint-env mocha */

var http = require('http');
var https = require('https');
var stream = require('stream');

var assert = require('chai').assert;
var sinon = require('sinon');

var auth = require('../../api/auth');
var authStore = require('../../api/auth-store');
var errors = require('../../api/errors');

describe('api/auth', function() {

  var httpRequest = http.request;
  var httpsRequest = https.request;
  var mockRequest = null;

  // {api_key: 'my-api-key'}
  var token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhcGlfa2V5Ijoib' +
      'XktYXBpLWtleSJ9.sYcuJzdUThIsvJGNymbobOh-nY6ZKFEqXTqwZS-4QvE';

  beforeEach(function() {
    mockRequest = {
      write: sinon.spy(),
      end: sinon.spy(),
      abort: sinon.spy()
    };
    http.request = sinon.spy(function() {
      return mockRequest;
    });
    https.request = sinon.spy(function() {
      return mockRequest;
    });
  });

  afterEach(function() {
    http.request = httpRequest;
    https.request = httpsRequest;
    mockRequest = null;
    authStore.clear();
    auth.logout();
  });

  describe('login()', function() {

    it('posts credentials to login endpoint', function() {
      var response = new stream.Readable();
      response.statusCode = 200;

      var email = 'user@email.com';
      var password = 'psswd';
      auth.login(email, password);

      assert.equal(https.request.callCount, 1);
      var args = https.request.getCall(0).args;
      assert.lengthOf(args, 2);
      var config = args[0];
      assert.equal(config.method, 'POST');

      assert.equal(mockRequest.write.callCount, 1);
      var body = mockRequest.write.getCall(0).args[0];
      assert.deepEqual(JSON.parse(body), {email: email, password: password});
    });

    it('expects a JWT token member in the response body', function(done) {
      var response = new stream.Readable();
      response.statusCode = 200;
      var body = {token: token};

      var email = 'user@email.com';
      var password = 'psswd';
      auth.login(email, password).then(function(success) {
        assert.isTrue(success);
        assert.equal(authStore.getToken(), token);
        assert.equal(authStore.getKey(), 'my-api-key');
        done();
      }).catch(done);

      assert.equal(https.request.callCount, 1);
      var args = https.request.getCall(0).args;
      assert.lengthOf(args, 2);
      var callback = args[1];
      callback(response);
      response.emit('data', JSON.stringify(body));
      response.emit('end');
    });

    it('rejects if body does not contain a token', function(done) {
      var response = new stream.Readable();
      response.statusCode = 200;
      var body = {foo: 'bar'};

      var email = 'user@email.com';
      var password = 'psswd';
      auth.login(email, password).then(function(success) {
        done(new Error('Expected rejection'));
      }, function(err) {
        assert.instanceOf(err, errors.UnexpectedResponse);
        done();
      }).catch(done);

      assert.equal(https.request.callCount, 1);
      var args = https.request.getCall(0).args;
      assert.lengthOf(args, 2);
      var callback = args[1];
      callback(response);
      response.emit('data', JSON.stringify(body));
      response.emit('end');
    });

    it('rejects if body contains a bogus token', function(done) {
      var response = new stream.Readable();
      response.statusCode = 200;
      var body = {token: 'bogus'};

      var email = 'user@email.com';
      var password = 'psswd';
      auth.login(email, password).then(function(success) {
        done(new Error('Expected rejection'));
      }, function(err) {
        assert.instanceOf(err, errors.UnexpectedResponse);
        done();
      }).catch(done);

      assert.equal(https.request.callCount, 1);
      var args = https.request.getCall(0).args;
      assert.lengthOf(args, 2);
      var callback = args[1];
      callback(response);
      response.emit('data', JSON.stringify(body));
      response.emit('end');
    });
  });

  describe('setKey()', function() {
    it('stores an API key', function() {
      var key = 'my-api-key';
      auth.setKey(key);
      assert.equal(authStore.getKey(), key);
    });
  });

  describe('logout()', function() {

    it('clears any previously stored token', function() {
      authStore.setToken(token);
      auth.logout();
      assert.isUndefined(authStore.getToken());
      assert.isUndefined(authStore.getKey());
    });

    it('clears any previously stored API key', function() {
      authStore.setKey('some-key');
      auth.logout();
      assert.isUndefined(authStore.getKey());
    });

  });

});
