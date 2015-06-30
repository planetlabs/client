## planet-client

A JavaScript client for [Planet's imagery API](https://www.planet.com/docs/).

### Installation

The `planet-client` requires Node >= 0.12.  Install the `planet-client` package `npm` (which comes with [Node](https://nodejs.org/)).

    npm install planet-client

### Using the Library

The `planet-client` package can be used in a Node based project or in the browser with a CommonJS module loader (like [Browserify](http://browserify.org/) or [Webpack](http://webpack.github.io/)).

The library requires a global [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) implementation.  This comes with Node >= 0.12 and [modern browsers](http://caniuse.com/#search=promise).  To use `planet-client` in an environment without `Promise`, you can [use a polyfill](https://www.google.com/search?q=promise+polyfill).

With the above prerequisites, you can start using the `planet-client` package in your application:

```js
var planet = require('planet-client');

// set up your API key for all future requests
planet.auth.setKey(process.env.PL_API_KEY);

var lastWeek = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000));

var query = {
  'acquired.gte': lastWeek.toISOString()
};

planet.scenes.search(query)
  .then(function(page) {
    console.log('Total count: ' + page.data.count + ' scenes since ' + lastWeek);
  })
  .catch(function(err) {
    console.error('Failed to fetch scenes:', err.message);
  });
```

See the list of modules to the left for details on what is exported by the library.
