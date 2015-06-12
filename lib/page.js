var url = require('url');

/**
 * Create a page of data.
 * @param {Object} data Data with optional prev and next links.
 * @param {function(Object):Promise} factory Function that creates a promise of
 *     new data given a query object.
 */
function Page(data, factory) {
  var links = data.links;

  this.prev = !links.prev ? null : function() {
    return factory(url.parse(links.prev, true).query);
  };

  this.next = !links.next ? null : function() {
    return factory(url.parse(links.next, true).query);
  };

  this.data = data;
}

module.exports = Page;
