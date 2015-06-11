## planet-client

A JavaScript client for [Planet's imagery API](https://www.planet.com/docs/).

### Installation

The `planet-client` package can be installed with `npm` (which comes with [Node](https://nodejs.org/)).  To add the package as a dependency to your project, run the following:

    npm install planet-client --save

### Use

The `planet-client` package can be used in a Node based project or in the browser with a CommonJS module loader (like [Browserify](http://browserify.org/) or [Webpack](http://webpack.github.io/)).

The library requires a global [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) implementation.  This comes with Node >= 0.12 and [modern browsers](http://caniuse.com/#search=promise).  To use `planet-client` in an environment without `Promise`, you can [use a polyfill](https://www.google.com/search?q=promise+polyfill).

### Contributing

To get set up, clone the repository and install the development dependencies:

    git clone git@github.com:planetlabs/planet-client-js.git
    cd planet-client-js
    npm install

Run the tests to ensure any changes meet the coding style and maintain the expected functionality:

    npm test

During development, you can start a file watcher that runs the linter and tests with any file changes:

    npm start

### License

© Planet Labs, Inc.

Licensed under the [Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0) (the "License"); you may not use this file except in compliance with the License.

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See [the License](http://www.apache.org/licenses/LICENSE-2.0) for the specific language governing permissions and limitations under the License.
