var fs = require('fs');
var path = require('path');
var url = require('url');

var Batch = require('batch');
var log = require('npmlog');

var addQueryParams = require('../util').addQueryParams;
var request = require('../request');
var util = require('./util');

var script = path.basename(__filename, '.js');

/**
 * Get the list of scenes.
 * @param {string} val The scenes option (if undefined, stdin is used).
 * @return {Promise.<Object>} A promise that resolves to the parsed scenes list.
 */
function resolveScenes(val) {
  var promise;
  if (!val) {
    promise = util.stdin();
  } else {
    promise = util.readFile(val);
  }
  return promise.then(function(str) {
    return JSON.parse(str);
  });
}

/**
 * Create a function for extracting a product URL from scene metadata.
 * @param {Object} opts CLI options.
 * @return {function(Object):string} A function that returns the appropriate
 *     product URL given a scene metadata object.
 */
function urlExtractor(opts) {
  var product = opts.product;
  var params = {
    size: opts.size,
    format: opts.format
  };
  return function(feature) {
    var properties = feature.properties;
    if (product === 'thumbnail') {
      return addQueryParams(properties.links.thumbnail, params);
    } else {
      return properties.data.products[product].full;
    }
  };
}

var FILENAME_RE = /filename="?(.*?)"?$/i;

/**
 * Create a downloader for a single product.
 * @param {string} productUrl Product URL.
 * @param {string} directory Path to output directory.
 * @return {function(function(Error))} A downloader function that expects a
 *     callback.
 */
function download(productUrl, directory) {
  return function(done) {
    log.verbose(script, 'getting %s', productUrl);
    request.get({url: productUrl, stream: true})
      .then(function(response) {
        response.on('error', done);
        response.on('end', done);
        var disposition = response.headers['content-disposition'];
        var match;
        if (disposition) {
          match = disposition.match(FILENAME_RE);
        }
        var output;
        if (match) {
          output = path.join(directory, match[1]);
        } else {
          output = path.join(
              directory, path.basename(url.parse(productUrl).pathname));
        }
        log.verbose(script, 'writing %s', output);
        var stream = fs.createWriteStream(output);
        stream.on('error', function(err) {
          if (err.code === 'ENOENT') {
            done(new Error('Output directory does not exist: ' + directory));
          } else {
            done(err);
          }
        });
        response.pipe(stream);
      })
      .catch(function(err) {
        done(new Error('Request failed: ' + err.message));
      });
  };
}

function downloadAll(urls, opts) {
  var directory = opts.directory;
  var batch = new Batch();
  batch.concurrency(opts.concurrency);
  urls.forEach(function(productUrl) {
    batch.push(download(productUrl, directory));
  });
  return new Promise(function(resolve, reject) {
    batch.end(function(err, results) {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

/**
 * Run the download-scenes command with the given options.
 * @param {Object} opts The CLI options for the command.
 * @return {Promise} A promise that resolves on success or is rejected with any
 *     error.
 */
function main(opts) {
  return resolveScenes(opts.scenes)
    .then(function(scenes) {
      var urls = scenes.features.map(urlExtractor(opts));
      return downloadAll(urls, opts);
    });
}

var products = [
  'thumbnail', 'analytic', 'visual'
];

var sizes = [
  'sm', 'md', 'lg'
];

var formats = [
  'png', 'jpg'
];

/**
 * Options for the download-scenes command.
 * @type {Object}
 */
var options = {
  scenes: {
    abbr: 's',
    help: 'Scenes list (if omitted, stdin is used)',
    metavar: 'FILE'
  },
  directory: {
    abbr: 'd',
    help: 'Output directory (must be an existing directory)',
    metavar: 'DIR',
    default: process.cwd()
  },
  product: {
    abbr: 'p',
    help: 'Product (one of ' + products.join(', ') + ')',
    metavar: 'NAME',
    choices: products,
    default: 'visual'
  },
  size: {
    abbr: 'z',
    help: 'Size (for thumbnail only, one of ' + sizes.join(', ') + ')',
    metavar: 'SIZE',
    choices: sizes,
    default: 'md'
  },
  format: {
    abbr: 'f',
    help: 'Format (for thumbnail only, one of ' + formats.join(', ') + ')',
    metavar: 'FMT',
    choices: formats,
    default: 'png'
  },
  concurrency: {
    abbr: 'c',
    help: 'Number of concurrent downloads',
    metavar: 'NUM',
    default: 16
  }
};

exports = module.exports = main;
exports.options = options;
