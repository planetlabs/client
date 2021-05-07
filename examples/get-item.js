const planet = require('../api');

async function main() {
  const item = await planet.items.get(
    'REOrthoTile',
    '20160909_140034_2334314_RapidEye-2'
  );
  console.log(JSON.stringify(item, null, 2)); // eslint-disable-line
}

if (require.main === module) {
  main();
}
