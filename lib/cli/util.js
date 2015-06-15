var fs = require('fs');

function choicesHelp(choices) {
  var help;
  if (choices.length === 2) {
    help = choices.join(' or ');
  } else {
    var last = choices.pop();
    help = choices.join(', ') + ', or ' + last;
  }
  return ' (' + help + ')';
}

function readFile(file) {
  return new Promise(function(resolve, reject) {
    fs.readFile(file, {encoding: 'utf8'}, function(err, data) {
      if (err) {
        var message;
        if (err.code === 'ENOENT') {
          message = 'File not found';
        } else if (err.code === 'EACCES') {
          message = 'Permission denied';
        } else if (err.code === 'EISDIR') {
          message = 'Got a directory instead of a file';
        } else {
          message = err.message;
        }
        reject(new Error(
            'Failed to read "' + file + '": ' + message));
        return;
      }
      resolve(data);
    });
  });
}

function stdin() {
  return new Promise(function(resolve, reject) {
    var data = '';

    process.stdin.setEncoding('utf8');

    process.stdin.on('readable', function() {
      var chunk = process.stdin.read();
      if (chunk !== null) {
        data += chunk;
      }
    });

    process.stdin.on('end', function() {
      resolve(data);
    });
  });
}

exports.choicesHelp = choicesHelp;
exports.readFile = readFile;
exports.stdin = stdin;
