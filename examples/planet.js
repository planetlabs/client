global.XMLHttpRequest = require('xhr2');

const planet = require('../api');

planet.auth.setKey(process.env.PL_API_KEY);

module.exports = planet;
