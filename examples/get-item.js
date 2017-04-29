const planet = require('../api');

planet.items
  .get('REOrthoTile', '20160909_140034_2334314_RapidEye-2')
  .then(function(item) {
    console.log(JSON.stringify(item, null, 2));
  })
  .catch(function(err) {
    console.error('Failed to fetch item types:', err.message);
  });
