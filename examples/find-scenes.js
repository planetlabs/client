/* eslint-disable no-console */

var planet = require('../lib/api/index');

planet.auth.setKey(process.env.PL_API_KEY);

var lastWeek = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000));

var query = {
  'acquired.gte': lastWeek.toISOString()
};

planet.scenes.search(query)
  .then(function(page) {
    console.log('Total count: ' + page.data.count + ' scenes since ' + lastWeek);
  })
  .catch(function(err) {
    console.error('Failed to fetch scenes:', err.message);
  });
