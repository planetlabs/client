## @planet/client

A JavaScript client for [Planet's imagery API](https://www.planet.com/docs/).  See the [client API docs](http://planetlabs.github.io/client/api/) for detail on using the package.

### Installation

The `@planet/client` requires Node >= 0.12.  Install the `@planet/client` package `npm` (which comes with [Node](https://nodejs.org/)).

    npm install @planet/client

The `@planet/client` package provides a library for use in your application and a `planet` executable for command line use.  See details on both below.

### Using the Library

The `@planet/client` package can be used in a Node based project or in the browser with a CommonJS module loader (like [Browserify](http://browserify.org/) or [Webpack](http://webpack.github.io/)).

It is also possible to load a standalone bundle of the library in a script tag.  Without a module loader, this will create a global `planet` object:

    <script src="https://unpkg.com/@planet/client/dist/planet.js"></script>

This will redirect to the most recent release.  To avoid the redirect, you can include a specific version number (e.g. https://unpkg.com/@planet/client@2.0.0/dist/planet.js).

The library requires a global [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) implementation.  This comes with Node >= 0.12 and [modern browsers](http://caniuse.com/#search=promise).  To use `@planet/client` in an environment without `Promise`, you can [use a polyfill](https://www.google.com/search?q=promise+polyfill).

See the [API docs](http://planetlabs.github.io/client/api/) for detail on using the package.

### Contributing

To get set up, clone the repository and install the development dependencies:

    git clone git@github.com:planetlabs/client.git
    cd client
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

You can view the doc output in the `build/doc` directory.

*Note* - Building the docs requires Node >= 8.0.

#### Publishing a release

Releases are published from the master branch.  To cut a new minor release, do this:

    npm version minor && git push --tags origin master && npm publish

The `postpublish` script will update the hosted version of [the docs](http://planetlabs.github.io/client/).

*Note* - Publishing a release requires Node >= 8.0.

[![Build Status][travis-image]][travis-url]

### License

© Planet Labs, Inc.

Licensed under the [Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0) (the "License"); you may not use this file except in compliance with the License.

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See [the License](http://www.apache.org/licenses/LICENSE-2.0) for the specific language governing permissions and limitations under the License.

[travis-url]: https://travis-ci.org/planetlabs/client
[travis-image]: https://img.shields.io/travis/planetlabs/client.svg
[coveralls-url]: https://coveralls.io/github/planetlabs/client
[coveralls-image]: https://coveralls.io/repos/planetlabs/client/badge.svg?branch=master&service=github
