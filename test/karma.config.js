var pkg = require('../package.json');

module.exports = function(karma) {
  karma.set({
    frameworks: ['polyfill', 'browserify', 'mocha'],
    files: ['api/*.test.js'],
    preprocessors: {
      'api/*.test.js': ['browserify', 'sourcemap']
    },
    browserify: {
      debug: true
    },
    polyfill: ['Promise']
  });

  if (process.env.TRAVIS) {
    if (!process.env.SAUCE_ACCESS_KEY) {
      process.stderr.write('SAUCE_ACCESS_KEY not set\n');
      process.exit(1);
    }

    var testName = process.env.TRAVIS_PULL_REQUEST
      ? `https://github.com/planetlabs/client/pull/${
          process.env.TRAVIS_PULL_REQUEST
        }`
      : `${pkg.name}@${pkg.version} (${process.env.TRAVIS_COMMIT})`;

    // see https://wiki.saucelabs.com/display/DOCS/Platform+Configurator
    // for platform and browserName options (Selenium API, node.js code)
    var customLaunchers = {
      SL_Chrome: {
        base: 'SauceLabs',
        browserName: 'chrome'
      },
      SL_Firefox: {
        base: 'SauceLabs',
        browserName: 'firefox'
      },
      SL_IE: {
        base: 'SauceLabs',
        platform: 'Windows 10',
        browserName: 'internet explorer'
      },
      SL_Edge: {
        base: 'SauceLabs',
        platform: 'Windows 10',
        browserName: 'MicrosoftEdge'
      },
      SL_Safari: {
        base: 'SauceLabs',
        platform: 'macos 10.12',
        browserName: 'safari'
      }
    };
    karma.set({
      sauceLabs: {
        testName: testName,
        recordScreenshots: false,
        startConnect: true,
        tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER,
        username: 'planet-labs',
        accessKey: process.env.SAUCE_ACCESS_KEY,
        connectOptions: {
          noSslBumpDomains: 'all'
        }
      },
      hostname: 'travis.dev',
      reporters: ['dots', 'saucelabs'],
      browserDisconnectTimeout: 10000,
      browserDisconnectTolerance: 1,
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
