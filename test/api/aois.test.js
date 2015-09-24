/* eslint-env mocha */

var assert = require('chai').assert;
var http = require('http');
var https = require('https');
var sinon = require('sinon');
var stream = require('readable-stream');
var createMockRequest = require('../util').createMockRequest;

var request = require('../../api/request');
var aois = require('../../api/aois');

var AOIS = 'https://api.planet.com/v0/aois/';

describe('api/aois', function() {

  var httpRequest = http.request;
  var httpsRequest = https.request;
  var requestGet = request.get;
  var mockRequest = null;

  beforeEach(function() {
    request.get = sinon.spy(function() {
      return Promise.resolve({});
    });
  });

  afterEach(function() {
    request.get = requestGet;
  });

  describe('get()', function() {
    it('should request an aoi by id', function() {
      aois.get(40);
      assert.equal(request.get.callCount, 1);
      assert.equal(request.get.args[0][0].url, AOIS + '40');
    });
  });

  describe('list()', function() {
    it('should list all aois', function() {
      aois.list();
      assert.equal(request.get.callCount, 1);
      assert.equal(request.get.args[0][0].url, AOIS);
    });
  });

  describe('create()', function() {

    beforeEach(function() {
      mockRequest = createMockRequest();
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
    });

    it('issues a multipart request', function(done) {
      aois.create('test', {name: 'test.json', contents: '{"success": true}'}).then(function() {
        var upload = mockRequest.write.args[0];
        assert.match(upload, /filename="test\.json"/);
        assert.match(upload, /\{"success"/);
      }).then(done).catch(done);

      var response = new stream.Readable();
      response.statusCode = 200;

      assert.equal(https.request.callCount, 1);

      var args = https.request.getCall(0).args;
      assert.lengthOf(args, 2);

      var callback = args[1];
      callback(response);
      response.emit('data', '');
      response.emit('end');
    });

  });

});
