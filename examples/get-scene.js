/* eslint-disable no-console */

var planet = require('../lib/index');

planet.auth.setKey(process.env.API_KEY);

planet.scenes.get('20150607_151548_081f')
  .then(function(scene) {
    console.log(JSON.stringify(scene, null, 2));
  })
  .catch(function(err) {
    console.error('Failed to fetch scene:', err.message);
  });
