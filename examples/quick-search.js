const planet = require('../api');

const {and, range} = planet.filter;

async function main() {
  const items = await planet.items.search({
    types: ['PSScene4Band', 'Landsat8L1G'],
    filter: and([
      range('cloud_cover', {gte: 0, lte: 0.4}),
      range('sun_elevation', {gte: 0, lte: 90})
    ]),
    query: {
      _page_size: 100
    },
    limit: 150,
    each: page => {
      console.log(`got ${page.length} items`);
    }
  });
  console.log(`total: ${items.length}`);
}

if (require.main === module) {
  main();
}
