const planet = require('../api');

async function main() {
  const search = await planet.searches.get('e5b8ae9f20d84d93b1b22fe76e79cfab');
  console.log(JSON.stringify(search, null, 2));
}

if (require.main === module) {
  main();
}
