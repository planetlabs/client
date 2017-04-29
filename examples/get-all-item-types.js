const planet = require('../api');

planet.types
  .search()
  .then(function(types) {
    console.log(JSON.stringify(types, null, 2));
  })
  .catch(function(err) {
    console.error('Failed to fetch item types:', err.message);
  });
