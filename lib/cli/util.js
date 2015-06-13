
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

exports.stdin = stdin;
