const planet = require('./planet');

planet.searches
  .get('e5b8ae9f20d84d93b1b22fe76e79cfab')
  .then(search => console.log(JSON.stringify(search, null, 2)))
  .catch(error => console.error(`Failed to fetch search: ${error.message}`));
