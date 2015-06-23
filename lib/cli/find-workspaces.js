var workspaces = require('../api/workspaces');

/**
 * Run the find-workspaces command with the given options.
 * @param {Object} opts The CLI options for the command.
 * @return {Promise.<string>} A promise that resolves to the string output (a
 *     list of workspaces) or is rejected with any error.
 */
function main(opts) {
  return workspaces.find();
}

/**
 * Options for the find-workspaces command.
 * @type {Object}
 */
var options = {
  limit: {
    alias: 'l',
    description: 'Limit the number of results',
    default: 1000
  }
};

exports.description = 'Find workspaces';
exports.main = main;
exports.options = options;
