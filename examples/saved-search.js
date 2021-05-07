const planet = require('../api');

async function main() {
  const items = await planet.items.search({
    id: '8be38918d1414ca499ed3f56759a380b',
    limit: 150,
    query: {
      _page_size: 100,
    },
  });
  console.log(`total: ${items.length}`); // eslint-disable-line
}

if (require.main === module) {
  main();
}
