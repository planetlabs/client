/* eslint-env jest */

var promiseWithRetry = require('../../api/retry');
var testUtil = require('../util');

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
  beforeEach(function() {
    testUtil.disableSetTimeout();
  });

  afterEach(testUtil.enableSetTimeout);

  describe('promiseWithRetry', function() {
    it('resolves to the value on success', function() {
      expect.assertions(2);

      var value = {foo: 'bar'};

      var promise = promiseWithRetry(1, resolveWith(value));
      expect(promise).toBeInstanceOf(Promise);

      return expect(promise).resolves.toEqual(value);
    });

    it('rejects if status is 400', function() {
      expect.assertions(1);

      var error400 = responseError(400);
      var promise = promiseWithRetry(2, rejectNTimes(100, error400));

      return expect(promise).rejects.toEqual(error400);
    });

    it('retries if status is 429', function() {
      expect.assertions(1);

      var value = {foo: 'bar'};

      var error429 = responseError(429);
      var promise = promiseWithRetry(3, rejectNTimes(2, error429, value));

      return expect(promise).resolves.toEqual(value);
    });

    it('retries if status is 500', function() {
      expect.assertions(1);

      var value = {foo: 'bar'};

      var error500 = responseError(500);
      var promise = promiseWithRetry(3, rejectNTimes(2, error500, value));

      return expect(promise).resolves.toEqual(value);
    });

    it('retries if status is 502', function() {
      expect.assertions(1);

      var value = {foo: 'bar'};

      var error502 = responseError(502);
      var promise = promiseWithRetry(3, rejectNTimes(2, error502, value));

      return expect(promise).resolves.toEqual(value);
    });

    it('gives up after too many retries', function() {
      expect.assertions(1);

      var value = {foo: 'bar'};

      var error502 = responseError(502);
      var promise = promiseWithRetry(2, rejectNTimes(3, error502, value));

      return expect(promise).rejects.toEqual(error502);
    });
  });
});
