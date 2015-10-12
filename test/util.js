var spy = require('sinon').spy;

function createMockRequest() {
  return {
    write: spy(),
    end: spy(),
    on: spy()
  };
}

exports.createMockRequest = createMockRequest;
