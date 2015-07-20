#!/usr/bin/env node

var path = require('path');

var bole = require('bole');
var homedir = require('os-homedir');
var pretty = require('bistre')();
var yargs = require('yargs');

var auth = require('../api/auth');
var cli = require('../cli/index');
var errors = require('../api/errors');
var util = require('../cli/util');
var version = require('../package.json').version;

var name = path.basename(__filename, '.js');
var levels = ['debug', 'info', 'warn', 'error'];
var log = bole(name);

var configPath = path.join(homedir(), '.planet.json');

var planet;
try {
  planet = require(configPath);
} catch (_) {
  planet = {};
}

var parser = yargs.usage('Usage: $0 <command> [options]')
  .options({
    'help': {
      alias: 'h'
    },
    'version': {
      alias: 'v'
    }
  })
  .demand(1, 1)
  .version(version, 'version')
  .help('help')
  .completion('completion', false)
  .strict();

var commonOptions = {
  'log-level': {
    description: 'Log level' + util.choicesHelp(levels),
    default: 'info'
  },
  'key': {
    alias: 'k',
    description: 'API key (can also be provided with a PL_API_KEY environment variable)',
    default: process.env.PL_API_KEY || planet.key
  }
};

for (var cmd in cli) {
  parser.command(cmd, cli[cmd].description, runner(cmd));
}

function runner(commandName) {
  var command = cli[commandName];
  return function(subYargs) {
    var subParser = subYargs
      .usage('Usage: $0 ' + commandName + ' [options]')
      .options(command.options)
      .options(commonOptions)
      .help('help')
      .strict();

    var options = subParser.argv;
    bole.output({
      level: options.logLevel,
      stream: pretty
    });

    if (!options.key && !command.optionalKey) {
      log.error(
          'Provide your API key with the "key" option or the PL_API_KEY ' +
          'environment variable.  Run `planet init` to store your key for ' +
          'future use.');
      process.exit(1);
    }
    auth.setKey(options.key);
    command.main(options).then(function(output) {
      if (output) {
        process.stdout.write(output);
      }
      process.exit(0);
    }).catch(function(err) {
      log.error(err.message);
      if (err instanceof errors.ResponseError) {
        if (err.response.body) {
          log.debug(err.response.body);
        } else {
          log.debug(err);
        }
      } else {
        log.debug(err);
      }
      process.exit(1);
    });
  };
}

pretty.pipe(process.stderr);
parser.parse(process.argv.slice(2));
