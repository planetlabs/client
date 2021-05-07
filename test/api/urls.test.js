/* eslint-env mocha */

const assert = require('chai').assert;

const urls = require('../../api/urls');

describe('api/urls', function () {
  let originalBase;
  beforeEach(function () {
    originalBase = urls.base();
  });
  afterEach(function () {
    urls.setBase(originalBase);
  });

  describe('join()', function () {
    it('joins URL parts', function () {
      const cases = [
        {
          actual: urls.join('http://example.com', 'foo'),
          expected: 'http://example.com/foo',
        },
        {
          actual: urls.join('http://example.com', 'foo', 'bar'),
          expected: 'http://example.com/foo/bar',
        },
        {
          actual: urls.join('http://example.com', 'foo', 'bar', 'bam'),
          expected: 'http://example.com/foo/bar/bam',
        },
        {
          actual: urls.join('http://example.com', 'foo', 'bar', 'bam', ''),
          expected: 'http://example.com/foo/bar/bam/',
        },
      ];

      for (let i = 0, ii = cases.length; i < ii; ++i) {
        const c = cases[i];
        assert.deepEqual(c.actual, c.expected, 'case ' + i);
      }
    });

    it('removes extra slashes', function () {
      const cases = [
        {
          actual: urls.join('http://example.com/', 'foo'),
          expected: 'http://example.com/foo',
        },
        {
          actual: urls.join('http://example.com/', '/foo', 'bar'),
          expected: 'http://example.com/foo/bar',
        },
        {
          actual: urls.join('http://example.com', 'foo/', '/bar/', 'bam/'),
          expected: 'http://example.com/foo/bar/bam',
        },
        {
          actual: urls.join('http://example.com', '', 'foo/', 'bam/', '', ''),
          expected: 'http://example.com/foo/bam/',
        },
      ];

      for (let i = 0, ii = cases.length; i < ii; ++i) {
        const c = cases[i];
        assert.deepEqual(c.actual, c.expected, 'case ' + i);
      }
    });

    it('works with numbers', function () {
      const cases = [
        {
          actual: urls.join('http://example.com', 42),
          expected: 'http://example.com/42',
        },
        {
          actual: urls.join('http://example.com', 0, 'foo'),
          expected: 'http://example.com/0/foo',
        },
        {
          actual: urls.join('http://example.com', 10, 'bar', 20),
          expected: 'http://example.com/10/bar/20',
        },
      ];

      for (let i = 0, ii = cases.length; i < ii; ++i) {
        const c = cases[i];
        assert.deepEqual(c.actual, c.expected, 'case ' + i);
      }
    });

    it('throws for invalid input', function () {
      function call() {
        urls.join('http://example.com', new Date());
      }
      assert.throws(call, Error, 'join must be called with strings or numbers');
    });

    it('works with degenerate cases', function () {
      const cases = [
        {
          actual: urls.join(),
          expected: '',
        },
        {
          actual: urls.join('', ''),
          expected: '',
        },
      ];

      for (let i = 0, ii = cases.length; i < ii; ++i) {
        const c = cases[i];
        assert.deepEqual(c.actual, c.expected, 'case ' + i);
      }
    });
  });

  describe('setBase()', function () {
    it('sets the base URL for the API', function () {
      const base = 'http://example.com/';
      urls.setBase(base);
      assert.equal(urls.base(), base);
    });
  });

  describe('base()', function () {
    it('returns the base URL for the API', function () {
      assert.equal(urls.base(), 'https://api.planet.com/');
    });
  });

  describe('login()', function () {
    it('returns the login URL', function () {
      assert.equal(
        urls.login(),
        'https://api.planet.com/auth/v1/experimental/public/users/authenticate'
      );
    });

    it('works with a custom base URL', function () {
      urls.setBase('http://example.com/');
      assert.equal(
        urls.login(),
        'http://example.com/auth/v1/experimental/public/users/authenticate'
      );
    });
  });

  describe('types()', function () {
    it('returns the item types URL', function () {
      assert.equal(urls.types(), 'https://api.planet.com/data/v1/item-types/');
    });

    it('returns the URL for a single item type', function () {
      assert.equal(
        urls.types('foo'),
        'https://api.planet.com/data/v1/item-types/foo'
      );
    });
  });

  describe('items()', function () {
    it('returns the URL for items of a specific type', function () {
      assert.equal(
        urls.items('mysat'),
        'https://api.planet.com/data/v1/item-types/mysat/items/'
      );
    });

    it('returns the URL for a single item', function () {
      assert.equal(
        urls.types('mysat', 'item-id'),
        'https://api.planet.com/data/v1/item-types/mysat/item-id'
      );
    });

    it('works with a custom base', function () {
      urls.setBase('https://example.com/');
      assert.equal(
        urls.types('mysat', 'item-id'),
        'https://example.com/data/v1/item-types/mysat/item-id'
      );
    });
  });

  describe('quickSearch()', function () {
    it('returns the quick-search URL', function () {
      assert.equal(
        urls.quickSearch(),
        'https://api.planet.com/data/v1/quick-search'
      );
    });

    it('works with a custom base', function () {
      urls.setBase('https://example.com/');
      assert.equal(
        urls.quickSearch(),
        'https://example.com/data/v1/quick-search'
      );
    });
  });

  describe('searches()', function () {
    it('returns the searches URL', function () {
      assert.equal(urls.searches(), 'https://api.planet.com/data/v1/searches/');
    });

    it('returns a single search URL', function () {
      assert.equal(
        urls.searches('foo'),
        'https://api.planet.com/data/v1/searches/foo'
      );
    });

    it('works with a custom base', function () {
      urls.setBase('https://example.com/');
      assert.equal(urls.searches(), 'https://example.com/data/v1/searches/');
    });
  });
});
