var request = require('./request');
var urls = require('./urls');
/**
 * Send password reset email.
 * @param {string} email Email address.
 * @return {HTTPClient} The http(s) client.
 */
function passwordReset(email) {
  return new Promise(function(resolve, reject) {
    return request
      .post({
        url: urls.passwordReset(),
        body: {
          email: email
        }
      })
      .then(function(res) {
        resolve(res.body);
      })
      .catch(reject);
  });
}

exports.passwordReset = passwordReset;
