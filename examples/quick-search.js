const planet = require('./planet');

const {and, range} = planet.filter;

planet.items
  .search({
    types: ['PSScene4Band', 'Landsat8L1G'],
    filter: and([
      range('cloud_cover', {gte: 0, lte: 0.4}),
      range('sun_elevation', {gte: 0, lte: 90})
    ]),
    query: {
      _page_size: 100
    },
    limit: 150,
    each: items => {
      console.log(`got ${items.length} items`);
    }
  })
  .then(() => console.log('done'))
  .catch(error => console.error(`Failed to fetch items: ${error.message}`));
