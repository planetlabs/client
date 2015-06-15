/* eslint-disable no-console */

var planet = require('../lib/index');

planet.auth.setKey(process.env.PL_API_KEY);

var query = {
  'intersects': 'POINT(-110 45)'
};

planet.quads.find('color_balance_mosaic', query)
  .then(function(page) {
    console.log(JSON.stringify(page.data, null, 2));
  })
  .catch(function(err) {
    console.error('Failed to fetch quads:', err.message);
  });
