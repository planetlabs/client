const planet = require('../api');

async function main() {
  const types = await planet.types.search();
  console.log(JSON.stringify(types, null, 2));
}

if (require.main === module) {
  main();
}
