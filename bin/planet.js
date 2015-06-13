#!/usr/bin/env node
var parser = require('nomnom');

var auth = require('../lib/auth');
var cli = require('../lib/cli/index');
var version = require('../package.json').version;

parser.script('planet');

parser
  .option('version', {
    abbr: 'v',
    flag: true,
    help: 'output the version number',
    callback: function() {
      return version;
    }
  })
  .option('key', {
    abbr: 'k',
    help: 'API key (can also be provided with a PL_API_KEY environment variable)',
    metavar: 'KEY',
    default: process.env.PL_API_KEY
  });

parser.command('find')
  .option('type', {
    abbr: 't',
    help: 'imagery type',
    metavar: 'TYPE',
    default: 'ortho'
  })
  .option('intersects', {
    abbr: 'i',
    help: 'find imagery in the given area (GeoJSON, WKT, or @- for stdin)',
    metavar: 'GEOM'
  })
  .callback(run);

function run(opts) {
  if (!opts.key) {
    process.stderr.write(
        'Provide your API key with the "key" option ' +
        'or the PL_API_KEY environment variable\n');
    process.exit(1);
  }
  auth.setKey(opts.key);
  var command = cli[opts[0]];
  command(opts)
    .then(function(result) {
      if (result) {
        process.stdout.write(result);
      }
    })
    .catch(function(err) {
      process.stderr.write(err.message + '\n');
      process.exit(1);
    });
}

parser.parse();
