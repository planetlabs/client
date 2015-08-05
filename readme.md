## planet-client

A JavaScript client for [Planet's imagery API](https://www.planet.com/docs/).

### Installation

The `planet-client` requires Node >= 0.12.  Install the `planet-client` package `npm` (which comes with [Node](https://nodejs.org/)).

    npm install planet-client

The `planet-client` package provides a library for use in your application and a `planet` executable for command line use.  See details on both below.

### Using the Library

The `planet-client` package can be used in a Node based project or in the browser with a CommonJS module loader (like [Browserify](http://browserify.org/) or [Webpack](http://webpack.github.io/)).

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

Run the tests to ensure any changes meet the coding style and maintain the expected functionality:

    npm test

During development, you can start a file watcher that runs the linter and tests with any file changes:

    npm start


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
[coveralls-image]: https://img.shields.io/coveralls/planetlabs/planet-client-js.svg
