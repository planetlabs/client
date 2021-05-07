global.XMLHttpRequest = require('xhr2');
const planet = require('./index-browser');

planet.auth.setKey(process.env.PL_API_KEY);

module.exports = planet;
