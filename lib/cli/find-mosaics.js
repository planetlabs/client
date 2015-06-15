var mosaics = require('../mosaics');

/**
 * Recursively fetch all pages until the limit is reached.
 * @param {Promise.<Page>} promise A promise that resolves to a page of mosaics.
 * @param {Array} list An array of mosaic metadata.
 * @param {number} limit The limit.
 * @return {Promise.<Array>} An array that resolves to an array of mosaics.
 */
function fetch(promise, list, limit) {
  return promise.then(function(page) {
    list = list.concat(page.data.mosaics);
    if (page.next && list.length < limit) {
      return fetch(page.next(), list, limit);
    } else {
      if (list.length > limit) {
        list.length = limit;
      }
      return list;
    }
  });
}

/**
 * Run the find-mosaics command with the given options.
 * @param {Object} opts The CLI options for the command.
 * @return {Promise.<string>} A promise that resolves to the string output or is
 *     rejected with any error.
 */
function main(opts) {
  var promise;
  if (opts.id) {
    promise = mosaics.get(opts.id);
  } else {
    var query = {
      count: Math.min(opts.limit, 500)
    };
    promise = fetch(mosaics.find(query), [], opts.limit);
  }
  return promise.then(function(data) {
    return JSON.stringify(data) + '\n';
  });
}

/**
 * Options for the find-mosaics command.
 * @type {Object}
 */
var options = {
  limit: {
    abbr: 'l',
    help: 'Limit the number of results',
    metavar: 'NUM',
    default: 1000
  },
  id: {
    abbr: 'i',
    help: 'A mosaic identifier',
    metavar: 'ID'
  }
};

exports = module.exports = main;
exports.options = options;
