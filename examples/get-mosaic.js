/* eslint-disable no-console */

var planet = require('../lib/api/index');

planet.auth.setKey(process.env.PL_API_KEY);

planet.mosaics.get('color_balance_mosaic')
  .then(function(mosaic) {
    console.log(JSON.stringify(mosaic, null, 2));
  })
  .catch(function(err) {
    console.error('Failed to fetch mosaic:', err.message);
  });
