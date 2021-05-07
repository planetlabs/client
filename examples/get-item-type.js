const planet = require('../api');

async function main() {
  const type = await planet.types.get('REOrthoTile');
  console.log(JSON.stringify(type, null, 2)); // eslint-disable-line
}

if (require.main === module) {
  main();
}
