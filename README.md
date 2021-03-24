# express-fs-autorouter
File-based auto routing for Express

Given a directory of `.js` files:

``` text
/project
└── api
    ├── index.js
    ├── login.js
    └── accounts
        └── index.js
```

Creates an Express router to automatically map URL paths to corresponding files:

``` text
/           =>  api/index.js
/login      =>  api/login.js
/accounts/  =>  api/accounts/index.js
```

## Installation

``` sh
yarn add express-fs-autorouter
# OR
npm install express-fs-autorouter
```

## Usage

In your Express app, use `autoRouter()`, passing in an absolute path to the
directory to search for `.js` handler files.

``` js
const { resolve } = require("path");
const express = require("express");
const autoRouter = require("express-fs-autorouter");

const app = express();

// auto-routing
const apiDir = resolve(__dirname, "api");
app.use(autoRouter(apiDir));

// start server
app.listen(8080);
```

In each handler file, export a connect-/Express-style handler function:

``` js
module.exports = (req, res) => {
  res.send("Hello, World!");
};
```

Or:

``` js
const express = require("express");

const handler = express();
module.exports = handler;

handler
  .route("*")
  .get((req, res) => {
    res.send("Hello, World!");
  });
```
