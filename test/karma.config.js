var pkg = require('../package.json');

module.exports = function(karma) {

  karma.set({
    frameworks: ['browserify', 'mocha'],
    files: ['api/*.test.js'],
    preprocessors: {
      'api/*.test.js': ['browserify', 'sourcemap']
    },
    browserify: {
      debug: true,
      transform: ['envify']
    }
  });

  if (process.env.TRAVIS) {

    if (!process.env.SAUCE_USERNAME || !process.env.SAUCE_ACCESS_KEY) {
      process.stderr.write('SAUCE_USERNAME or SAUCE_ACCESS_KEY not set\n');
      process.exit(1);
    }

    var customLaunchers = {
      'SL_Chrome': {
        base: 'SauceLabs',
        browserName: 'chrome'
      },
      'SL_Firefox': {
        base: 'SauceLabs',
        browserName: 'firefox'
      }
    };
    karma.set({
      sauceLabs: {
        testName: pkg.name + ' ' + pkg.version,
        recordScreenshots: false,
        connectOptions: {
          port: 5757
        },
        startConnect: false,
        tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER,
        username: process.env.SAUCE_USERNAME,
        accessKey: process.env.SAUCE_ACCESS_KEY
      },
      reporters: ['dots', 'saucelabs'],
      captureTimeout: 240000,
      browserNoActivityTimeout: 240000,
      customLaunchers: customLaunchers,
      browsers: Object.keys(customLaunchers)
    });

  } else {

    karma.set({
      browsers: ['Chrome']
    });

  }

};
