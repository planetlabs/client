var Metalsmith = require('metalsmith');
var handlebars = require('handlebars');
var inPlace = require('metalsmith-in-place');
var layouts = require('metalsmith-layouts');
var marked = require('marked');

var pkg = require('../package.json');
var api = require('../build/api.json');

function getNamed(name, array) {
  var item;
  for (var i = 0, ii = array.length; i < ii; ++i) {
    if (array[i].name === name) {
      item = array[i];
      break;
    }
  }
  if (!item) {
    item = {name: name};
    array.push(item);
  }
  return item;
}

var MODULE_NAME_RE = /^module:([\w-\/]+)~/;

function getModuleName(longname) {
  var match = longname.match(MODULE_NAME_RE);
  if (!match) {
    throw new Error('Expected to parse a module name from ' + longname);
  }
  return match[1];
}

var CLASS_NAME_RE = /^module:[\w-\/]+~([A-Z]\w+)$/;

function getClassName(memberof) {
  var match = memberof.match(CLASS_NAME_RE);
  if (!match) {
    throw new Error('Expected to parse a class name from ' + memberof);
  }
  return match[1];
}

function getModule(longname, modules) {
  var name = getModuleName(longname);
  return getNamed(name, modules);
}

function getClass(memberof, classes) {
  var name = getClassName(memberof);
  return getNamed(name, classes);
}

function organizeDocs(docs) {
  var modules = [];
  for (var i = 0, ii = docs.length; i < ii; ++i) {
    var doc = docs[i];
    var module;
    switch (doc.kind) {
      case 'module':
        module = getNamed(doc.name, modules);
        assign(module, doc);
        break;
      case 'class':
        module = getModule(doc.longname, modules);
        if (!module.classes) {
          module.classes = [];
        }
        module.classes.push(doc);
        break;
      case 'function':
        module = getModule(doc.longname, modules);
        if (doc.scope === 'instance') {
          if (!module.classes) {
            module.classes = [];
          }
          var cls = getClass(doc.memberof, module.classes);
          if (!cls.methods) {
            cls.methods = [];
          }
          cls.methods.push(doc);
        } else {
          if (!module.functions) {
            module.functions = [];
          }
          module.functions.push(doc);
        }
        break;
      default:
        //pass
    }
  }
  return modules;
}

function assign(target, source) {
  for (var key in source) {
    target[key] = source[key];
  }
  return target;
}

function main(callback) {

  var modules = organizeDocs(api.docs).filter(function(module) {
    return module.access !== 'private';
  }).sort(function(a, b) {
    return a.name < b.name ? -1 : 1;
  });

  var smith = new Metalsmith('.')
      .source('doc/src')
      .destination('build/doc')
      .concurrency(25)
      .metadata({
        version: pkg.version,
        modules: modules
      })
      .use(inPlace({
        engine: 'handlebars',
        partials: 'doc/partials',
        helpers: {
          instance: function(memberof) {
            var className = getClassName(memberof);
            return className.charAt(0).toLowerCase() + className.slice(1);
          },
          join: function(array, sep) {
            return array.join(sep);
          },
          listParams: function(params) {
            if (!params) {
              return '';
            }
            return params.map(function(param) {
              return param.name;
            }).filter(function(name) {
              return name.indexOf('.') === -1;
            }).join(', ');
          },
          lower: function(str) {
            return str.charAt(0).toLowerCase() + str.slice(1);
          },
          md: function(str) {
            return new handlebars.SafeString(marked(str));
          }
        }
      }))
      .use(layouts({
        engine: 'handlebars',
        directory: 'doc/layouts'
      }))
      .build(function(err) {
        callback(err);
      });

  return smith;
}

if (require.main === module) {
  main(function(err) {
    if (err) {
      process.stderr.write(
          'Building docs failed.  See the full trace below.\n\n' +
          err.stack + '\n');
      process.exit(1);
    } else {
      process.exit(0);
    }
  });
}

module.exports = main;
