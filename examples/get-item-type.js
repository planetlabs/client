const planet = require('../api');

async function main() {
  const type = await planet.types.get('REOrthoTile');
  console.log(JSON.stringify(type, null, 2));
}

if (require.main === module) {
  main();
}
