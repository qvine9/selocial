var path = Npm.require("path");
var fs = Npm.require("fs");
var glob = Npm.require("glob");

log = function (message) {
  return console.log("Bower: ", message);
};


function BowerCompiler() {}
BowerCompiler.prototype.processFilesForTarget = function (files) {
    if (!files.length) return;
    if (files[0].getArch() !== "web.browser") return;

    var mergedBowerTree = {};

    files.forEach(function (file) {
        if (file.getBasename() === "bower.json"){
            var bowerTree = JSON.parse(file.getContentsAsString());

            for (var key in bowerTree) {
                if (_.isArray(bowerTree[key])){
                    mergedBowerTree[key] || (mergedBowerTree[key] = []);
                    _.each(bowerTree[key], function(item){
                        mergedBowerTree[key].push(item);
                    });
                } else if (_.isObject(bowerTree[key])) {
                    mergedBowerTree[key] || (mergedBowerTree[key] = {});
                    _.each(bowerTree[key], function(item, itemKey){
                        mergedBowerTree[key][itemKey] = item;
                    });
                } else if (typeof(mergedBowerTree[key]) === 'undefined') {
                    mergedBowerTree[key] = bowerTree[key];
                }
            }
        }
    });

    var bowerHome = "./bower",
        bowerFile = (process.env.PWD || '.') + "/.meteor/local/bower.json";

    fs.writeFileSync(bowerFile, JSON.stringify(mergedBowerTree), "utf8");

    return bowerHandler(files[0], mergedBowerTree, bowerHome, bowerFile);

};


var bowerHandler = function (compileStep, bowerTree, bowerHome, bowerFile) {

    if (! _.isObject(bowerTree.dependencies))
      compileStep.error({
        message: "Bower dependencies list must be a dictionary in " + bowerFile
      });

    var bowerInstall = function (options) {
      options = _.extend(options || {}, {directory: bowerHome});
      return Bower.install([], { save: true, forceLatest: true }, options);
    };

    var mapBowerDefinitions = function (definition, name) {
      if (!_.isString(definition))
        compileStep.error({
          message: "Definitions in the bower list must be strings. " + bowerFile
        });

      if (definition.indexOf('/') !== -1)
        return name + "=" + definition;
      else
        return name + "#" + definition;
    };

    var cwd = path.dirname(bowerFile);

    var installList = _.map(bowerTree.dependencies, mapBowerDefinitions);

    // Installation
    if (installList.length) {
      var installedPackages = [];
      // Try to install packages offline first.
      try {
        installedPackages = bowerInstall({ offline: true, cwd: cwd });
      } catch (e) {
        log(e);

        // In case of failure, try to fetch packages online
        try {
          installedPackages = bowerInstall({ cwd: cwd });
        } catch (f) {
          log(f);
        }
      }

      _.each(installedPackages, function (val, pkgName) {
         log(pkgName + " v" + val.pkgMeta.version + " successfully installed");
      });
    }

    // Get all packages in localCache and their dependencies recursively.
    var localCache = Bower.list(null, {offline: true, directory: bowerHome, cwd: cwd});
    var bowerDependencies = getDependencies(localCache);

    if (_.isArray(bowerTree.ignoredDependencies)) {
      bowerDependencies = _.filter(bowerDependencies, function(dep) {
        return ! _.contains(bowerTree.ignoredDependencies, dep.pkgName);
      });

    } else if (bowerTree.ignoredDependencies) {
      compileStep.error({
        message: "Bower ignoredDependencies must be an array in " + bowerFile
      });
    }

    // Loop over packages, look at each `.bower.json` attribute `main` and
    // add the associated file to the Meteor bundle.
    // XXX If a package is present more than once (potentialy in different
    // versions from different places), we should only include it once with the
    // good version. Hopefully the `constraint-solver` package will help.
    _.each(bowerDependencies, function (item) {
      var pkgName = item.pkgMeta._originalSource || item.pkgName;
      if (pkgName.indexOf('/') !== -1 || pkgName.indexOf('@') !== -1) {
        // it's a url, probably not what we are looking for
        pkgName = item.pkgMeta.name;
      }

      var pkgPath = path.join(cwd, bowerHome, pkgName);
      var infos = item.pkgMeta;

      // Bower overrides support
      if (bowerTree.overrides && bowerTree.overrides[pkgName]) {
        _.extend(infos, bowerTree.overrides[pkgName]);
      }

      compileArch = "client";

      if (! _.has(infos, "arch"))
        infos.arch = ['client'];

      if ([].concat(infos.arch).indexOf(compileArch) === -1)
        return;

      if (! _.has(infos, "main"))
        return;

      if (_.isString(infos.main))
        infos.main = [infos.main];

      toInclude = [];
      if (infos.main)
        toInclude = toInclude.concat(infos.main);

      var matches = function (files) {
        return _.map(files, function(pattern) {
            if (!pattern) {
                return [];
            }
          return glob.sync(pattern, { cwd: pkgPath });
        });
      };
      toInclude = _.uniq(_.flatten(matches(toInclude)));

      _.each(toInclude, function (fileName) {
        var contentPath = path.join(pkgPath, fileName);
        var packageName = compileStep.getPackageName();
        var virtualPath = 'bower/' + pkgName + '/' + fileName;
        var content;
        var ext;

        // Only load real files
        if (!fs.lstatSync(contentPath).isFile()) {
          return;
        }

        content = fs.readFileSync(contentPath);
        ext = path.extname(fileName).slice(1);

        // XXX It would be cool to be able to add a ressource and let Meteor use
        // the right source handler.
        if (ext === "js") {
          compileStep.addJavaScript({
            path: virtualPath,
            data: content.toString('utf8')
                        .replace(/require\(['"]jquery['"]\)/, 'jQuery')
                        .replace(/require\(['"]angular['"]\)/, 'angular')
          });
        } else if (ext === "css") {
          if (compileArch === "client") {
              compileStep.addStylesheet({
                path: virtualPath,
                data: content.toString('utf8')
              });
          }
        } else {
          compileStep.addAsset({
            path: virtualPath,
            data: content
          });
        }
      });
    });
};

/****************/
/* JSON Loaders */
/****************/

var loadJSONContent = function (compileStep, content) {
  try {
    return JSON.parse(content);
  } catch (e) {
    compileStep.error({
      message: "Syntax error in " + compileStep.inputPath,
      line: e.line,
      column: e.column
    });
  }
};

var loadJSONFile = function (compileStep) {
  var content = compileStep.read().toString('utf8');
  return loadJSONContent(compileStep, content);
};

var parseJSONFile = function(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) { }

  return null;
};

var getDependencies = function( pkg, depth, list ){
  depth = depth || 0;
  list = list || [];
  var item = _.findWhere(list, {"pkgName": pkg.pkgMeta.name});
  if (item === undefined) {
    list.push({
      "pkgName": pkg.pkgMeta.name,
      "pkgMeta": pkg.pkgMeta,
      "depth": depth
    });
  } else {
    item.depth = depth;
  }
  _.each(pkg.dependencies, function(value, key){
    getDependencies(value, depth + 1, list);
  });
  return sortDependencies(list);
};

var sortDependencies = function(dependencies) {
  var sortedDependencies = [];
  var sorted = -1;
  while (sortedDependencies.length < dependencies.length && sorted < sortedDependencies.length) {
    sorted = sortedDependencies.length;
    _.each(dependencies, function (dependency) {
      var ok = false;
      if (sortedDependencies.indexOf(dependency) === -1) {
        ok = true;
        if (dependency.pkgMeta.dependencies) {
          _.each(_.keys(dependency.pkgMeta.dependencies), function (pkgName) {
            if (!_.findWhere(sortedDependencies, {pkgName: pkgName}))
              ok = false;
          });
        }
        if (ok)
          sortedDependencies.push(dependency);
      }
    });
  }
  return _.union(sortedDependencies, dependencies);
};

/*******************/
/* Source Handlers */
/*******************/
Plugin.registerCompiler(
    {
        extensions: ["json"],
        filenames: []
    },
    function () {
        return new BowerCompiler();
    }
);
