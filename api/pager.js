var request = require('./request');

module.exports = function(config, key, each, controlledPaging) {
  var limit = 'limit' in config ? config.limit : Infinity;
  var pageSize = config.query && config.query._page_size;

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
    var count = 0;
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
      count += data.length;
      var done = count >= limit;
      if (done) {
        data.length = data.length - (count - limit);
      }
      if (!done && pageSize) {
        // avoid fetching last empty page
        done = data.length < pageSize;
      }
      each(data);
      if (!aborted) {
        var links = response.body._links || {};
        if (controlledPaging && links._next) {
          data.getNextPage = function() {
            request
              .get({url: links._next, terminator: config.terminator})
              .then(handler)
              .catch(reject);
          };
        } else if (!done && links._next) {
          request
            .get({url: links._next, terminator: config.terminator})
            .then(handler)
            .catch(reject);
        } else {
          resolve(all);
        }
      }
      each(data);
    }

    request
      .request(config)
      .then(handler)
      .catch(reject);
  });
};
