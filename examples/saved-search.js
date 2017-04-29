const planet = require('../api');

async function main() {
  const items = await planet.items.search({
    id: '8be38918d1414ca499ed3f56759a380b',
    limit: 150,
    query: {
      _page_size: 100
    },
    each: items => {
      console.log(`got ${items.length} items`);
    }
  });
  console.log(`total: ${items.length}`);
}

if (require.main === module) {
  main();
}
