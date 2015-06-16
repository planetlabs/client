#!/usr/bin/env node

var log = require('npmlog');
var yargs = require('yargs');

var auth = require('../lib/auth');
var cli = require('../lib/cli/index');
var util = require('../lib/cli/util');
var version = require('../package.json').version;

var levels = ['silly', 'verbose', 'info', 'warn', 'error'];

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
    log.level = options.logLevel;
    if (!options.key) {
      process.stderr.write(
          'Provide your API key with the "key" option ' +
          'or the PL_API_KEY environment variable\n');
      process.exit(1);
    }
    auth.setKey(options.key);
    command.main(options).then(function(output) {
      if (output) {
        process.stdout.write(output);
      }
      process.exit(0);
    }).catch(function(err) {
      log.error(commandName, err.stack);
      process.stderr.write(err.message + '\n');
      process.exit(1);
    });
  };
}

parser.parse(process.argv.slice(2));
