const planet = require('../api');

planet.items
  .search({
    id: 'e5b8ae9f20d84d93b1b22fe76e79cfab',
    limit: 150,
    query: {
      _page_size: 100
    },
    each: items => {
      console.log(`got ${items.length} items`);
    }
  })
  .then(() => console.log('done'))
  .catch(error => console.error(`Failed to fetch items: ${error.message}`));
