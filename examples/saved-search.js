const planet = require('./planet');

const limit = 150;
let total = 0;
let abort;

planet.items
  .search({
    terminator: terminate => abort = terminate,
    id: 'e5b8ae9f20d84d93b1b22fe76e79cfab',
    query: {
      _page_size: 100
    },
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
