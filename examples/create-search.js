const planet = require('./planet');
const {and, range} = planet.filter;

planet.searches
  .create({
    name: 'example search',
    types: ['PSScene4Band', 'Landsat8L1G'],
    filter: and([
      range('cloud_cover', {gte: 0, lte: 0.4}),
      range('sun_elevation', {gte: 0, lte: 90})
    ])
  })
  .then(search => console.log(search.id))
  .catch(error => console.error(`Failed to create search: ${error.message}`));
