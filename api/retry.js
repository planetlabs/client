var ClientError = require('./errors').ClientError;

var factor = 2;
var maxDelay = 2500;
var baseDelay = 100;

function promiseWithRetry(retries, executor) {
  return new Promise(function(resolve, reject) {
    var attempts = 0;
    function attempt() {
      var promise = new Promise(executor);

      promise.then(resolve);

      promise.catch(function(error) {
        if (attempts >= retries) {
          reject(error);
          return;
        }

        if (error instanceof ClientError) {
          reject(error);
          return;
        }

        if (error.response) {
          // only retry if 429 or 5xx
          var status = error.response.status;
          if (status !== 429 && status < 500) {
            reject(error);
            return;
          }
        }

        ++attempts;
        var delay =
          Math.random() *
          Math.min(maxDelay, baseDelay * Math.pow(factor, attempts));

        attempt();
        setTimeout(attempt, delay);
      });
    }

    attempt();
  });
}

module.exports = promiseWithRetry;
