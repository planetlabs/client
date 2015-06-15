#!/usr/bin/env node
var path = require('path');

var log = require('npmlog');
var parser = require('nomnom');

var auth = require('../lib/auth');
var cli = require('../lib/cli/index');
var util = require('../lib/cli/util');
var version = require('../package.json').version;

var script = path.basename(__filename, '.js');

parser.script(script);

var levels = ['silly', 'verbose', 'info', 'warn', 'error'];

parser.options({
  version: {
    abbr: 'v',
    flag: true,
    help: 'Output the version number',
    callback: function() {
      return version;
    }
  },
  logLevel: {
    full: 'log-level',
    choices: levels,
    default: 'info',
    help: 'Log level' + util.choicesHelp(levels),
    metavar: 'LEVEL'
  },
  key: {
    abbr: 'k',
    help: 'API key (can also be provided with a PL_API_KEY environment variable)',
    metavar: 'KEY',
    default: process.env.PL_API_KEY
  }
});

for (var name in cli) {
  parser.command(name)
    .options(cli[name].options)
    .callback(run);
}

function run(opts) {
  if (!opts.key) {
    process.stderr.write(
        'Provide your API key with the "key" option ' +
        'or the PL_API_KEY environment variable\n');
    process.exit(1);
  }
  auth.setKey(opts.key);

  cli[opts[0]](opts)
    .then(function(result) {
      if (result) {
        process.stdout.write(result);
      }
    })
    .catch(function(err) {
      process.stderr.write(err.message + '\n');
      log.verbose(opts[0], err.stack);
      process.exit(1);
    });
}

var options = parser.parse();
log.level = options.logLevel;
