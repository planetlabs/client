var scenes = require('../scenes');
var util = require('./util');

function getIntersects(val) {
  var promise;
  if (!val) {
    promise = Promise.resolve(null);
  } else if (val === '@-') {
    promise = util.stdin();
  } else {
    promise = Promise.resolve(val);
  }
  return promise;
}

function findScenes(opts) {
  return getIntersects(opts.intersects)
    .then(function(geom) {
      var query = {
        intersects: geom
      };
      return scenes.find(query);
    }).then(function(page) {
      return JSON.stringify({
        type: 'FeatureCollection',
        features: page.data.features
      }) + '\n';
    });
}

function main(opts) {
  var promise;
  if (opts.type === 'ortho') {
    promise = findScenes(opts);
  } else {
    promise = Promise.reject(new Error('Unsupported "type" option: ' + opts.type));
  }
  return promise;
}

module.exports = main;
