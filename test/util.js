var spy = require('sinon').spy;

var GlobalXHR = global.XMLHttpRequest;

exports.mockXHR = function() {
  var mock = {
    open: spy(),
    addEventListener: spy(),
    setRequestHeader: spy(),
    send: spy(),
    abort: spy()
  };

  global.XMLHttpRequest = function() {
    for (var method in mock) {
      this[method] = mock[method];
    }
  };

  return mock;
};

exports.unmockXHR = function() {
  global.XMLHttpRequest = GlobalXHR;
};

var realSetTimeout = global.setTimeout;

exports.disableSetTimeout = function() {
  global.setTimeout = function(fn) {
    fn();
  };
};

exports.enableSetTimeout = function() {
  global.setTimeout = realSetTimeout;
};
