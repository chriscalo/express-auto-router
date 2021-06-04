const { join, parse, relative } = require("path");
const globby = require("globby");
const express = require("express");
const UrlPattern = require("url-pattern");

const defaults = {
  // rename to filePattern?
  pattern: "**/*.js",
};

module.exports = function autoRouter(dir=process.cwd(), options) {
  
  options = {
    ...defaults,
    ...options,
  };
  
  // TODO: make this customizable
  const urlPatternOptions = {
    segmentNameStartChar: "$",
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
    
    const browserPathPattern = new UrlPattern(browserPath, urlPatternOptions);
    return withOptionalTrailingSlash(browserPathPattern.regex);
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

// takes a URL pattern matching regex and returns one where the trailing slash
// has been made optional
function withOptionalTrailingSlash(regex) {
  const { source } = regex;
  const trailingSlashPattern = /\\\/\$$/;
  const optionalTrailingSlash = "\\\/?$";
  const updatedSource = source.replace(
    trailingSlashPattern,
    optionalTrailingSlash,
  );
  return new RegExp(updatedSource);
}
