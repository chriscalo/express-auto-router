const { join, parse, relative, sep } = require("path");
const globby = require("globby");
const express = require("express");

const defaults = {
  // rename to filePattern?
  pattern: "**/*.js",
};

module.exports = function autoRouter(dir=process.cwd(), options) {
  
  options = {
    ...defaults,
    ...options,
  };
  
  const pattern = join(dir, options.pattern);
  
  // FIXME: make this async
  const filePaths = globby.sync(pattern);
  
  const app = express();
  configureApp(app, filePaths);
  return app;
  
  async function configureApp(app, filePaths) {
    
    for (const filePath of filePaths) {
      const config = {
        filePath,
        browserPath: toBrowserPath(filePath, dir),
        module: require(filePath),
      };
      
      console.log(config);
      
      app.all(config.browserPath, config.module);
    }
    
  }
};

function toBrowserPath(filePath, dir) {
  let browserPath = fileSystemToBrowserPath(filePath, dir);
  debugger;
  browserPath = toForwardSlashes(browserPath);
  debugger;
  browserPath = addRouteParams(browserPath);
  debugger;
  browserPath = removeIndexAndExtension(browserPath);
  debugger;
  
  return browserPath;
}

function fileSystemToBrowserPath(filePath, root) {
  const pathFromRootDirToFile = relative(root, filePath);
  const absoluteBrowserPath = join("/", pathFromRootDirToFile);
  return absoluteBrowserPath;
}

// force forward slashes because this is for a browser context
function toForwardSlashes(path) {
  return String(path).replace(/\\/g, "/");
}

function removeIndexAndExtension(path) {
  const parsed = parse(path);
  
  if (parsed.base === "index.js") {
    return join(parsed.dir, "/");
  } else {
    return join(parsed.dir, parsed.name);
  }
}

function addRouteParams(path) {
  const parsed = parse(path);
  
  parsed.dir = parsed.dir
    .split("/")
    .map(withRouteParams)
    .join("/");
  
  return unparse(parsed);
}

function unparse(pathObject) {
  return join(pathObject.dir, pathObject.base);
}

function withRouteParams(dir) {
  const pattern = /\[(?<name>.*)\]/;
  const match = pattern.exec(dir);
  if (match) {
    const { name } = match.groups;
    return `:${name}`;
  } else {
    return dir;
  }
}
