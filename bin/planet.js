#!/usr/bin/env node

var repl = require('repl');
global.XMLHttpRequest = require('xhr2');
const planet = require('../api');

planet.auth.setKey(process.env.PL_API_KEY);

repl.start('planet> ').context.planet = planet;
