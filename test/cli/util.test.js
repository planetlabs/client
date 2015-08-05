/* eslint-env mocha */
var EventEmitter = require('events').EventEmitter;
var fs = require('fs');

var assert = require('chai').assert;

var util = require('../../cli/util');

describe('cli/util', function() {

  describe('choicesHelp()', function() {

    var choicesHelp = util.choicesHelp;

    it('concatenates choices', function() {
      assert.equal(choicesHelp(['foo', 'bar']), ' (foo or bar)');
    });

    it('adds commas', function() {
      assert.equal(choicesHelp(['foo', 'bar', 'bam']), ' (foo, bar, or bam)');
    });

  });

  describe('readFile()', function() {

    var orig = {};
    beforeEach(function() {
      for (var key in fs) {
        orig[key] = fs[key];
      }
    });

    afterEach(function() {
      for (var key in orig) {
        fs[key] = orig[key];
      }
      orig = {};
    });

    it('calls fs.readFile()', function(done) {
      fs.readFile = function(name, options, callback) {
        callback(null, 'called fs.readFile');
      };

      util.readFile('foo.txt').then(function(text) {
        assert.equal(text, 'called fs.readFile');
        done();
      }).catch(done);
    });

    it('rejects on ENOENT', function(done) {
      var error = new Error('not found');
      error.code = 'ENOENT';

      fs.readFile = function(name, options, callback) {
        callback(error);
      };

      util.readFile('foo.txt').then(function(text) {
        done(new Error('Expected rejection'));
      }).catch(function(err) {
        assert.instanceOf(err, Error);
        assert.include(err.message, 'File not found');
        done();
      }).catch(done);
    });

    it('rejects on EACCES', function(done) {
      var error = new Error('permission');
      error.code = 'EACCES';

      fs.readFile = function(name, options, callback) {
        callback(error);
      };

      util.readFile('foo.txt').then(function(text) {
        done(new Error('Expected rejection'));
      }).catch(function(err) {
        assert.instanceOf(err, Error);
        assert.include(err.message, 'Permission denied');
        done();
      }).catch(done);
    });

    it('rejects on EISDIR', function(done) {
      var error = new Error('directory');
      error.code = 'EISDIR';

      fs.readFile = function(name, options, callback) {
        callback(error);
      };

      util.readFile('foo.txt').then(function(text) {
        done(new Error('Expected rejection'));
      }).catch(function(err) {
        assert.instanceOf(err, Error);
        assert.include(err.message, 'Got a directory instead of a file');
        done();
      }).catch(done);
    });

    it('rejects on any error', function(done) {
      var error = new Error('any error');

      fs.readFile = function(name, options, callback) {
        callback(error);
      };

      util.readFile('foo.txt').then(function(text) {
        done(new Error('Expected rejection'));
      }).catch(function(err) {
        assert.instanceOf(err, Error);
        assert.include(err.message, 'any error');
        done();
      }).catch(done);
    });

  });

  describe('stdin()', function() {

    var stdin = process.stdin;
    afterEach(function() {
      process.stdin = stdin;
    });

    it('resolves to text read from stdin', function(done) {
      process.stdin = new EventEmitter();
      process.stdin.read = function() {
        return 'read from stdin';
      };

      util.stdin().then(function(text) {
        assert.equal(text, 'read from stdin');
        done();
      }).catch(done);

      process.stdin.emit('readable');
      process.stdin.emit('end');
    });

  });

});
