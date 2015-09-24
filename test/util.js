var spy = require('sinon').spy;

function createMockRequest() {
  return {
    write: spy(),
    end: spy(),
    abort: spy(),
    on: spy()
  };
}

exports.createMockRequest = createMockRequest;
