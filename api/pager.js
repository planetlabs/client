var request = require('./request');

module.exports = function(config, key, each) {
  var aborted = false;
  var terminator = config.terminator;
  config.terminator = function(abort) {
    if (terminator) {
      terminator(function() {
        aborted = true;
        abort();
      });
    }
  };

  return new Promise(function(resolve, reject) {
    var all;
    if (!each) {
      each = function(array) {
        if (!all) {
          all = array;
        } else {
          all = all.concat(array);
        }
      };
    }

    function handler(response) {
      var data = response.body[key];
      each(data);
      if (!aborted) {
        var links = response.body._links || {};
        if (links._next) {
          request
            .get({url: links._next, terminator: config.terminator})
            .then(handler)
            .catch(reject);
        } else {
          resolve(all);
        }
      }
    }

    request.request(config).then(handler).catch(reject);
  });
};
