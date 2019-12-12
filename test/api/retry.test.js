/* eslint-env mocha */
var chai = require('chai');
var promiseWithRetry = require('../../api/retry');

chai.config.truncateThreshold = 0;
var assert = chai.assert;

function rejectNTimes(n, error, value) {
  var count = 0;
  return function(resolve, reject) {
    ++count;
    if (count <= n) {
      reject(error);
    } else {
      resolve(value);
    }
  };
}

function resolveWith(value) {
  return function(resolve) {
    resolve(value);
  };
}

function responseError(status) {
  var error = new Error('status ' + status);
  error.response = {status: status};
  return error;
}

describe('api/retry', function() {
  describe('promiseWithRetry', function() {
    it('resolves to the value on success', function(done) {
      var value = {foo: 'bar'};

      var promise = promiseWithRetry(1, resolveWith(value));
      assert.instanceOf(promise, Promise);

      promise.then(function(resolved) {
        assert.deepEqual(resolved, value);
        done();
      });
      promise.catch(done);
    });

    it('rejects if status is 400', function(done) {
      var error400 = responseError(400);
      var promise = promiseWithRetry(2, rejectNTimes(100, error400));

      promise.then(function() {
        done(new Error('expected rejection'));
      });
      promise.catch(function(error) {
        assert.equal(error, error400);
        done();
      });
    });

    it('retries if status is 429', function(done) {
      var value = {foo: 'bar'};

      var error429 = responseError(429);
      var promise = promiseWithRetry(3, rejectNTimes(2, error429, value));

      promise.then(function(resolved) {
        assert.equal(resolved, value);
        done();
      });
      promise.catch(done);
    });

    it('retries if status is 500', function(done) {
      var value = {foo: 'bar'};

      var error500 = responseError(500);
      var promise = promiseWithRetry(3, rejectNTimes(2, error500, value));

      promise.then(function(resolved) {
        assert.equal(resolved, value);
        done();
      });
      promise.catch(done);
    });

    it('retries if status is 502', function(done) {
      var value = {foo: 'bar'};

      var error502 = responseError(502);
      var promise = promiseWithRetry(3, rejectNTimes(2, error502, value));

      promise.then(function(resolved) {
        assert.equal(resolved, value);
        done();
      });
      promise.catch(done);
    });

    it('gives up after too many retries', function(done) {
      var value = {foo: 'bar'};

      var error502 = responseError(502);
      var promise = promiseWithRetry(2, rejectNTimes(3, error502, value));

      promise.then(function() {
        done(new Error('expected rejection'));
      });
      promise.catch(function(error) {
        assert.equal(error, error502);
        done();
      });
    });
  });
});
