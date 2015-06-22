/* eslint-disable no-console */

var planet = require('../lib/api/index');

planet.auth.setKey(process.env.PL_API_KEY);

planet.quads.get('color_balance_mosaic', 'L15-0392E-1316N')
  .then(function(quad) {
    console.log(JSON.stringify(quad, null, 2));
  })
  .catch(function(err) {
    console.error('Failed to fetch quad:', err.message);
  });
