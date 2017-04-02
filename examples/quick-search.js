const planet = require('./planet');

const limit = 150;
let total = 0;
let abort;

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
    terminator: terminate => abort = terminate,
    each: items => {
      const count = items.length;
      console.log(`got ${count} items`);
      total += count;
      if (total >= limit) {
        abort();
        console.log('limit reached');
      }
    }
  })
  .then(() => console.log('done'))
  .catch(error => console.error(`Failed to fetch items: ${error.message}`));
