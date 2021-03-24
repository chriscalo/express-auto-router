const { join, parse, relative } = require("path");
const globby = require("globby");
const express = require("express");

const defaults = {
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
  
  const router = express.Router();
  configureRouter(router, filePaths);
  return router;
  
  function browserPath(filePath) {
    let browserPath = join("/", relative(dir, filePath));
    const parsedBrowserPath = parse(browserPath);
    
    if (parsedBrowserPath.base === "index.js") {
      browserPath = join(parsedBrowserPath.dir, "/");
    } else {
      browserPath = join(parsedBrowserPath.dir, parsedBrowserPath.name);
    }
    return browserPath;
  }
  
  async function configureRouter(router, filePaths) {
    
    for (const filePath of filePaths) {
      const config = {
        filePath,
        browserPath: browserPath(filePath),
      };
      
      router.all(config.browserPath, function (req, res, next) {
        const handler = require(filePath);
        handler(req, res, next);
      });
    }
    
  }
};
