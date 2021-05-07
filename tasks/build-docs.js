const Metalsmith = require('metalsmith');
const handlebars = require('handlebars');
const inPlace = require('metalsmith-in-place');
const layouts = require('metalsmith-layouts');
const marked = require('marked');

const pkg = require('../package.json');
const api = require('../build/api.json');

function getNamed(name, array) {
  let item;
  for (let i = 0, ii = array.length; i < ii; ++i) {
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

const MODULE_NAME_RE = /^module:([\w-\/]+)~/;

function getModuleName(longname) {
  const match = longname.match(MODULE_NAME_RE);
  if (!match) {
    throw new Error('Expected to parse a module name from ' + longname);
  }
  return match[1];
}

const CLASS_NAME_RE = /^module:[\w-\/]+~([A-Z]\w+)$/;

function getClassName(memberof) {
  const match = memberof.match(CLASS_NAME_RE);
  if (!match) {
    throw new Error('Expected to parse a class name from ' + memberof);
  }
  return match[1];
}

function getModule(longname, modules) {
  const name = getModuleName(longname);
  return getNamed(name, modules);
}

function getClass(memberof, classes) {
  const name = getClassName(memberof);
  return getNamed(name, classes);
}

function organizeDocs(docs) {
  const modules = [];
  for (let i = 0, ii = docs.length; i < ii; ++i) {
    const doc = docs[i];
    switch (doc.kind) {
      case 'module': {
        const mod = getNamed(doc.name, modules);
        assign(mod, doc);
        break;
      }
      case 'class': {
        const mod = getModule(doc.longname, modules);
        if (!mod.classes) {
          mod.classes = [];
        }
        const cls = getClass(doc.longname, mod.classes);
        assign(cls, doc);
        break;
      }
      case 'member': {
        const mod = getModule(doc.longname, modules);
        const cls = getClass(doc.memberof, mod.classes);
        if (!cls.members) {
          cls.members = [];
        }
        cls.members.push(doc);
        break;
      }
      case 'function': {
        const mod = getModule(doc.longname, modules);
        if (doc.scope === 'instance') {
          if (!mod.classes) {
            mod.classes = [];
          }
          const cls = getClass(doc.memberof, mod.classes);
          if (!cls.methods) {
            cls.methods = [];
          }
          cls.methods.push(doc);
        } else {
          if (!mod.functions) {
            mod.functions = [];
          }
          mod.functions.push(doc);
        }
        break;
      }
      default:
      //pass
    }
  }
  return modules;
}

function assign(target, source) {
  for (const key in source) {
    target[key] = source[key];
  }
  return target;
}

function main(callback) {
  const modules = organizeDocs(api.docs)
    .filter(function (module) {
      return module.access !== 'private';
    })
    .sort(function (a, b) {
      return a.name < b.name ? -1 : 1;
    });

  const smith = new Metalsmith('.')
    .source('doc/src')
    .destination('build/doc')
    .concurrency(25)
    .metadata({
      version: pkg.version,
      modules: modules,
    })
    .use(
      inPlace({
        engine: 'handlebars',
        partials: 'doc/partials',
        helpers: {
          short: function (name) {
            return name.replace(/^api\//, '');
          },
          long: function (name) {
            return '@planet/client/' + name;
          },
          instance: function (memberof) {
            const className = getClassName(memberof);
            return className.charAt(0).toLowerCase() + className.slice(1);
          },
          listParams: function (params) {
            if (!params) {
              return '';
            }
            return params
              .map(function (param) {
                return param.name;
              })
              .filter(function (name) {
                return name.indexOf('.') === -1;
              })
              .join(', ');
          },
          linkType: function (type) {
            const openIndex = type.lastIndexOf('<');
            const closeIndex = type.indexOf('>');
            let match, link;
            if (openIndex >= 0 && closeIndex > openIndex) {
              match = type
                .slice(openIndex + 1, closeIndex)
                .match(CLASS_NAME_RE);
              if (match) {
                link = new handlebars.SafeString(
                  type.slice(0, openIndex + 1).replace('<', '&lt;') +
                    '<a href="#' +
                    match[0] +
                    '">' +
                    match[1] +
                    '</a>' +
                    type.slice(closeIndex).replace('>', '&gt;')
                );
              } else {
                link = type;
              }
            } else {
              match = type.match(CLASS_NAME_RE);
              if (match) {
                link = new handlebars.SafeString(
                  '<a href="#' + match[0] + '>' + match[1] + '</a>'
                );
              } else {
                link = type;
              }
            }
            return link;
          },
          lower: function (str) {
            return str.charAt(0).toLowerCase() + str.slice(1);
          },
          md: function (str) {
            return new handlebars.SafeString(marked(str));
          },
        },
      })
    )
    .use(
      layouts({
        engine: 'handlebars',
        directory: 'doc/layouts',
      })
    )
    .build(function (err) {
      callback(err);
    });

  return smith;
}

if (require.main === module) {
  main(function (err) {
    if (err) {
      process.stderr.write(
        'Building docs failed.  See the full trace below.\n\n' +
          err.stack +
          '\n'
      );
      process.exit(1);
    } else {
      process.exit(0);
    }
  });
}

module.exports = main;
