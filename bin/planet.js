#!/usr/bin/env node

const repl = require('repl');
const planet = require('../api');

repl.start('planet> ').context.planet = planet;
