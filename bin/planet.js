#!/usr/bin/env node
var log = require('npmlog');
var parser = require('nomnom');

var auth = require('../lib/auth');
var cli = require('../lib/cli/index');
var version = require('../package.json').version;

var script = 'planet';

parser.script(script);

parser
  .option('version', {
    abbr: 'v',
    flag: true,
    help: 'Output the version number',
    callback: function() {
      return version;
    }
  })
  .option('loglevel', {
    choices: ['silly', 'verbose', 'info', 'warn', 'error'],
    default: 'info',
    help: 'Log level',
    metavar: 'LEVEL'
  })
  .option('key', {
    abbr: 'k',
    help: 'API key (can also be provided with a PL_API_KEY environment variable)',
    metavar: 'KEY',
    default: process.env.PL_API_KEY
  });

parser.command('find-scenes')
  .option('type', {
    abbr: 't',
    help: 'Imagery type',
    metavar: 'TYPE',
    default: 'ortho'
  })
  .option('limit', {
    abbr: 'l',
    help: 'Limit the number of results',
    metavar: 'NUM',
    default: 1000
  })
  .option('acquired', {
    help: 'Filter by image acquisition time (ISO-8601 formatted date time with .. for ranges).',
    metavar: 'TIME',
    type: 'string'
  })
  .option('intersects', {
    help: 'Find imagery in the given area (GeoJSON, WKT, @FILE, or @- for stdin)',
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
      log.verbose(script, err.stack);
      process.exit(1);
    });
}

var options = parser.parse();
log.level = options.loglevel;
