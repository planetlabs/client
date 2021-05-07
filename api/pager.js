const request = require('./request');

module.exports = function (config, key, each) {
  const limit = 'limit' in config ? config.limit : Infinity;
  const pageSize = config.query && config.query._page_size;

  let aborted = false;
  const terminator = config.terminator;
  config.terminator = function (abort) {
    if (terminator) {
      terminator(function () {
        aborted = true;
        abort();
      });
    }
  };

  return new Promise(function (resolve, reject) {
    let count = 0;
    let all;
    if (!each) {
      each = function (array) {
        if (!all) {
          all = array;
        } else {
          all = all.concat(array);
        }
        return true;
      };
    }

    function handler(response) {
      const data = response.body[key];
      count += data.length;
      let done = count >= limit;
      if (done) {
        data.length = data.length - (count - limit);
      }
      if (!done && pageSize) {
        // avoid fetching last empty page
        done = data.length < pageSize;
      }

      if (!aborted) {
        const links = response.body._links || {};
        const more = !done && !!links._next;

        const next = !more
          ? function () {}
          : function () {
              request
                .get({url: links._next, terminator: config.terminator})
                .then(handler)
                .catch(reject);
            };

        const keepGoing = each(data, more, next);

        if (keepGoing === false) {
          return;
        }

        if (!done && more) {
          next();
        } else {
          resolve(all);
        }
      }
    }

    request.request(config).then(handler).catch(reject);
  });
};
