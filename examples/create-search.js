const planet = require('../api');

const {and, range} = planet.filter;

async function main() {
  const search = await planet.searches.create({
    name: 'example search',
    types: ['PSScene4Band', 'Landsat8L1G'],
    filter: and([
      range('cloud_cover', {gte: 0, lte: 0.4}),
      range('sun_elevation', {gte: 0, lte: 90}),
    ]),
  });
  console.log(search.id); // eslint-disable-line
}

if (require.main === module) {
  main();
}
