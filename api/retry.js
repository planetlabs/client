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

        var status = error.response && error.response.status;
        if (status === 429 || status >= 500) {
          ++attempts;

          var delay =
            Math.random() *
            Math.min(maxDelay, baseDelay * Math.pow(factor, attempts));

          setTimeout(attempt, delay);
        } else {
          reject(error);
        }
      });
    }

    attempt();
  });
}

module.exports = promiseWithRetry;
