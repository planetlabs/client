/* eslint-env jest */

var urls = require('../../api/urls');

describe('api/urls', function() {
  var originalBase;
  beforeEach(function() {
    originalBase = urls.base();
  });
  afterEach(function() {
    urls.setBase(originalBase);
  });

  describe('join()', function() {
    it('joins URL parts', function() {
      var cases = [
        {
          actual: urls.join('http://example.com', 'foo'),
          expected: 'http://example.com/foo'
        },
        {
          actual: urls.join('http://example.com', 'foo', 'bar'),
          expected: 'http://example.com/foo/bar'
        },
        {
          actual: urls.join('http://example.com', 'foo', 'bar', 'bam'),
          expected: 'http://example.com/foo/bar/bam'
        },
        {
          actual: urls.join('http://example.com', 'foo', 'bar', 'bam', ''),
          expected: 'http://example.com/foo/bar/bam/'
        }
      ];

      for (var i = 0, ii = cases.length; i < ii; ++i) {
        var c = cases[i];
        expect(c.actual).toEqual(c.expected);
      }
    });

    it('removes extra slashes', function() {
      var cases = [
        {
          actual: urls.join('http://example.com/', 'foo'),
          expected: 'http://example.com/foo'
        },
        {
          actual: urls.join('http://example.com/', '/foo', 'bar'),
          expected: 'http://example.com/foo/bar'
        },
        {
          actual: urls.join('http://example.com', 'foo/', '/bar/', 'bam/'),
          expected: 'http://example.com/foo/bar/bam'
        },
        {
          actual: urls.join('http://example.com', '', 'foo/', 'bam/', '', ''),
          expected: 'http://example.com/foo/bam/'
        }
      ];

      for (var i = 0, ii = cases.length; i < ii; ++i) {
        var c = cases[i];
        expect(c.actual).toEqual(c.expected);
      }
    });

    it('works with numbers', function() {
      var cases = [
        {
          actual: urls.join('http://example.com', 42),
          expected: 'http://example.com/42'
        },
        {
          actual: urls.join('http://example.com', 0, 'foo'),
          expected: 'http://example.com/0/foo'
        },
        {
          actual: urls.join('http://example.com', 10, 'bar', 20),
          expected: 'http://example.com/10/bar/20'
        }
      ];

      for (var i = 0, ii = cases.length; i < ii; ++i) {
        var c = cases[i];
        expect(c.actual).toEqual(c.expected);
      }
    });

    it('throws for invalid input', function() {
      function call() {
        urls.join('http://example.com', new Date());
      }
      expect(call).toThrow();
    });

    it('works with degenerate cases', function() {
      var cases = [
        {
          actual: urls.join(),
          expected: ''
        },
        {
          actual: urls.join('', ''),
          expected: ''
        }
      ];

      for (var i = 0, ii = cases.length; i < ii; ++i) {
        var c = cases[i];
        expect(c.actual).toEqual(c.expected);
      }
    });
  });

  describe('setBase()', function() {
    it('sets the base URL for the API', function() {
      var base = 'http://example.com/';
      urls.setBase(base);
      expect(urls.base()).toEqual(base);
    });
  });

  describe('base()', function() {
    it('returns the base URL for the API', function() {
      expect(urls.base()).toEqual('https://api.planet.com/');
    });
  });

  describe('login()', function() {
    it('returns the login URL', function() {
      expect(urls.login()).toEqual(
        'https://api.planet.com/auth/v1/experimental/public/users/authenticate'
      );
    });

    it('works with a custom base URL', function() {
      urls.setBase('http://example.com/');
      expect(urls.login()).toEqual(
        'http://example.com/auth/v1/experimental/public/users/authenticate'
      );
    });
  });

  describe('types()', function() {
    it('returns the item types URL', function() {
      expect(urls.types()).toEqual(
        'https://api.planet.com/data/v1/item-types/'
      );
    });

    it('returns the URL for a single item type', function() {
      expect(urls.types('foo')).toEqual(
        'https://api.planet.com/data/v1/item-types/foo'
      );
    });
  });

  describe('items()', function() {
    it('returns the URL for items of a specific type', function() {
      expect(urls.items('mysat')).toEqual(
        'https://api.planet.com/data/v1/item-types/mysat/items/'
      );
    });

    it('returns the URL for a single item', function() {
      expect(urls.types('mysat', 'item-id')).toEqual(
        'https://api.planet.com/data/v1/item-types/mysat/item-id'
      );
    });

    it('works with a custom base', function() {
      urls.setBase('https://example.com/');
      expect(urls.types('mysat', 'item-id')).toEqual(
        'https://example.com/data/v1/item-types/mysat/item-id'
      );
    });
  });

  describe('quickSearch()', function() {
    it('returns the quick-search URL', function() {
      expect(urls.quickSearch()).toEqual(
        'https://api.planet.com/data/v1/quick-search'
      );
    });

    it('works with a custom base', function() {
      urls.setBase('https://example.com/');
      expect(urls.quickSearch()).toEqual(
        'https://example.com/data/v1/quick-search'
      );
    });
  });

  describe('searches()', function() {
    it('returns the searches URL', function() {
      expect(urls.searches()).toEqual(
        'https://api.planet.com/data/v1/searches/'
      );
    });

    it('returns a single search URL', function() {
      expect(urls.searches('foo')).toEqual(
        'https://api.planet.com/data/v1/searches/foo'
      );
    });

    it('works with a custom base', function() {
      urls.setBase('https://example.com/');
      expect(urls.searches()).toEqual('https://example.com/data/v1/searches/');
    });
  });
});
