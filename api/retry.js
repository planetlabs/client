const ClientError = require('./errors').ClientError;

const factor = 2;
const maxDelay = 2500;
const baseDelay = 100;

function promiseWithRetry(retries, executor) {
  return new Promise(function (resolve, reject) {
    let attempts = 0;
    function attempt() {
      const promise = new Promise(executor);

      promise.then(resolve);

      promise.catch(function (error) {
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
          const status = error.response.status;
          if (status !== 429 && status < 500) {
            reject(error);
            return;
          }
        }

        ++attempts;
        const delay =
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
