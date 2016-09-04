## planet-client

A JavaScript client for [Planet's imagery API](https://www.planet.com/docs/).

### Installation

The `planet-client` requires Node >= 0.12.  Install the `planet-client` package `npm` (which comes with [Node](https://nodejs.org/)).

    npm install planet-client

The `planet-client` package provides a library for use in your application and a `planet` executable for command line use.  See details on both below.

### Using the Library

The `planet-client` package can be used in a Node based project or in the browser with a CommonJS module loader (like [Browserify](http://browserify.org/) or [Webpack](http://webpack.github.io/)).

It is also possible to load a standalone bundle of the library in a script tag.  Without a module loader, this will create a global `planet` object:

    <script src="https://unpkg.com/planet-client/dist/planet.js"></script>

This will redirect to the most recent release.  To avoid the redirect, you can include a specific version number (e.g. https://unpkg.com/planet-client@1.2.0/dist/planet.js).

The library requires a global [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) implementation.  This comes with Node >= 0.12 and [modern browsers](http://caniuse.com/#search=promise).  To use `planet-client` in an environment without `Promise`, you can [use a polyfill](https://www.google.com/search?q=promise+polyfill).

See the `examples` directory for example use of the library.

### Using the CLI

The `planet-client` package provides a `planet` executable.  This can be installed globally (`npm install --global planet-client`), or if you install it locally, you can add the executable to your path (`export PATH=path/to/node_modules/.bin:$PATH`).

The general syntax for the `planet` executable is `planet <command> [options]`.  To see a list of commands, run the following:

    planet --help

You can get help for a specific command by adding `--help` to the command name (e.g. `planet find-scenes --help`).

To take advantage of command line completion with the `planet` executable, you can run the following in bash:

    eval "$(planet completion)"

To enable this every time you start a new shell, you can append the output of `planet completion` to your `.bashrc`:

    planet completion >> ~/.bashrc

The CLI will be fully documented when it is a bit more stable.  For now, you can get a preview of what's available with this video:

[![screen shot][video-image]][video-url]

### Contributing

To get set up, clone the repository and install the development dependencies:

    git clone git@github.com:planetlabs/planet-client-js.git
    cd planet-client-js
    npm install

#### Running the tests

The tests are run in a browser and in Node.  You can run the linter and all tests once with the following:

    npm test

To start a file watcher that runs the linter and tests with any file changes:

    npm start

With the `npm start` task running, you can attach any number of browsers to the [test server](http://localhost:9876/).  Every time you attach a new browser, tests run in all browsers.  To debug any failing test, visit the test runner [debug page](http://localhost:9876/debug.html) and open your development console.

#### Building the docs

The project docs are generated from templates in the `doc` directory.  The API docs are generated based on annotations in comments throughout the `api` modules.  You can build the docs with the following task:

    npm run doc

If you are making frequent changes and want to rebuild the docs with each change, use the `npm run start-doc` task.  You can view the doc output in the `build/doc` directory.

*Note* - Building the docs requires Node >= 4.0.

#### Publishing a release

Releases are published from the master branch.  To cut a new minor release, do this:

    npm version minor && git push --tags origin master && npm publish

The `postpublish` script will update the hosted version of [the docs](http://planetlabs.github.io/planet-client-js/).

*Note* - Publishing a release requires Node >= 4.0.

[![Build Status][travis-image]][travis-url]
[![Coverage Status][coveralls-image]][coveralls-url]

### License

© Planet Labs, Inc.

Licensed under the [Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0) (the "License"); you may not use this file except in compliance with the License.

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See [the License](http://www.apache.org/licenses/LICENSE-2.0) for the specific language governing permissions and limitations under the License.

[video-url]: https://vimeo.com/134018559
[video-image]: https://raw.githubusercontent.com/wiki/planetlabs/planet-client-js/planet-client.png
[travis-url]: https://travis-ci.org/planetlabs/planet-client-js
[travis-image]: https://img.shields.io/travis/planetlabs/planet-client-js.svg
[coveralls-url]: https://coveralls.io/github/planetlabs/planet-client-js
[coveralls-image]: https://coveralls.io/repos/planetlabs/planet-client-js/badge.svg?branch=master&service=github
