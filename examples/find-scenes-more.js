/* eslint-disable no-console */

var planet = require('../lib/api/index');

planet.auth.setKey(process.env.PL_API_KEY);

var lastWeek = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000));

var query = {
  'acquired.gte': lastWeek.toISOString()
};

var scenes = [];
var limit = 500;

function fetch(promise) {
  return promise.then(function(page) {
    scenes = scenes.concat(page.data.features);
    console.log('got ' + scenes.length + ' scenes');
    if (page.next && scenes.length < limit) {
      return fetch(page.next());
    }
  });
}

fetch(planet.scenes.search(query))
  .then(function() {
    console.log('done fetching');
  }).catch(function(err) {
    console.error('Failed to fetch scenes:', err.message);
  });
