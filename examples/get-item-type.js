const planet = require('./planet');

planet.itemTypes
  .get('REOrthoTile')
  .then(function(type) {
    console.log(JSON.stringify(type, null, 2));
  })
  .catch(function(err) {
    console.error('Failed to fetch item type:', err.message);
  });
