#!/usr/bin/env node

var bole = require('bole');
var pretty = require('bistre')();
var yargs = require('yargs');

var auth = require('../lib/auth');
var cli = require('../lib/cli/index');
var errors = require('../lib/errors');
var util = require('../lib/cli/util');
var version = require('../package.json').version;

var levels = ['debug', 'info', 'warn', 'error'];
var log = bole('planet');

var parser = yargs.usage('Usage: $0 <command> [options]')
  .options({
    'help': {
      alias: 'h'
    },
    'version': {
      alias: 'v'
    }
  })
  .demand(1)
  .version(version, 'version')
  .help('help')
  .strict();

var commonOptions = {
  'log-level': {
    description: 'Log level' + util.choicesHelp(levels),
    default: 'info'
  },
  'key': {
    alias: 'k',
    description: 'API key (can also be provided with a PL_API_KEY environment variable)',
    default: process.env.PL_API_KEY
  }
};

for (var name in cli) {
  parser.command(name, cli[name].description, runner(name));
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

    if (!options.key) {
      log.error(
          'Provide your API key with the "key" option ' +
          'or the PL_API_KEY environment variable');
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
