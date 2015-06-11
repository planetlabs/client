/* eslint-env mocha */
var http = require('http');
var https = require('https');

var chai = require('chai');
var sinon = require('sinon');

var request = require('../../lib/request');

chai.config.truncateThreshold = 0;
var assert = chai.assert;

describe('request()', function() {

  var httpRequest = http.request;
  var httpsRequest = https.request;
  var noop = function() {};

  beforeEach(function() {
    var mockRequest = {
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
  });

  it('provides a shorthand for calling http.request()', function() {
    request('http://example.com', noop);
    assert.equal(http.request.callCount, 1);
  });

  it('uses https.request() for https URLs', function() {
    request('https://example.com', noop);
    assert.equal(https.request.callCount, 1);
  });

});


describe('request.parseConfig()', function() {

  var defaultHeaders = {'accept': 'application/json'};

  it('generates request options from a URL', function() {
    var config = 'http://example.com';
    var options = {
      protocol: 'http:',
      hostname: 'example.com',
      port: '80',
      method: 'GET',
      path: '/',
      headers: defaultHeaders
    };

    assert.deepEqual(request.parseConfig(config), options);
  });

  it('uses the correct default port for https', function() {
    var config = 'https://example.com';
    var options = {
      protocol: 'https:',
      hostname: 'example.com',
      port: '443',
      method: 'GET',
      path: '/',
      headers: defaultHeaders
    };

    assert.deepEqual(request.parseConfig(config), options);
  });

  it('respects the port in the URL', function() {
    var config = 'http://example.com:8000';
    var options = {
      protocol: 'http:',
      hostname: 'example.com',
      port: '8000',
      method: 'GET',
      path: '/',
      headers: defaultHeaders
    };

    assert.deepEqual(request.parseConfig(config), options);
  });

  it('respects a query string in the URL', function() {
    var config = 'http://example.com/page?foo=bar';
    var options = {
      protocol: 'http:',
      hostname: 'example.com',
      port: '80',
      method: 'GET',
      path: '/page?foo=bar',
      headers: defaultHeaders
    };

    assert.deepEqual(request.parseConfig(config), options);
  });

  it('accepts a config with url and query', function() {
    var config = {
      url: 'http://example.com/page',
      query: {
        foo: 'bar bam'
      }
    };
    var options = {
      protocol: 'http:',
      hostname: 'example.com',
      port: '80',
      method: 'GET',
      path: '/page?foo=bar%20bam',
      headers: defaultHeaders
    };

    assert.deepEqual(request.parseConfig(config), options);
  });

  it('extends an existing URL query string with query object', function() {
    var config = {
      url: 'http://example.com/page?foo=bar',
      query: {
        bam: 'baz'
      }
    };
    var options = {
      protocol: 'http:',
      hostname: 'example.com',
      port: '80',
      method: 'GET',
      path: '/page?foo=bar&bam=baz',
      headers: defaultHeaders
    };

    assert.deepEqual(request.parseConfig(config), options);
  });

  it('allows query object to override query string', function() {
    var config = {
      url: 'http://example.com/?foo=bar',
      query: {
        foo: 'bam'
      }
    };
    var options = {
      protocol: 'http:',
      hostname: 'example.com',
      port: '80',
      method: 'GET',
      path: '/?foo=bam',
      headers: defaultHeaders
    };

    assert.deepEqual(request.parseConfig(config), options);
  });

  it('passes along the withCredentials option', function() {
    var config = {
      url: 'http://example.com/',
      withCredentials: false
    };
    var options = {
      protocol: 'http:',
      hostname: 'example.com',
      port: '80',
      method: 'GET',
      path: '/',
      headers: defaultHeaders,
      withCredentials: false
    };

    assert.deepEqual(request.parseConfig(config), options);
  });

});
