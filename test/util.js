const spy = require('sinon').spy;
const polyXHR = require('xhr2');

const realXHR = global.XMLHttpRequest;

exports.mockXHR = function () {
  const mock = {
    open: spy(),
    addEventListener: spy(),
    setRequestHeader: spy(),
    send: spy(),
    abort: spy(),
  };

  global.XMLHttpRequest = function () {
    for (const method in mock) {
      this[method] = mock[method];
    }
  };

  return mock;
};

exports.polyfillXHR = function () {
  global.XMLHttpRequest = polyXHR;
};

exports.restoreXHR = function () {
  global.XMLHttpRequest = realXHR;
};

const realSetTimeout = global.setTimeout;

exports.disableSetTimeout = function () {
  global.setTimeout = function (fn) {
    fn();
  };
};

exports.enableSetTimeout = function () {
  global.setTimeout = realSetTimeout;
};
