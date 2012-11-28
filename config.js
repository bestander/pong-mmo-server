var log4js = require('log4js');

// configuring log for the whole application
var defaultLogProperties = {
  "appenders": [
    {
      "type": "console",
      "category": "main"
    },
    {
      "type": "console",
      "category": "game"
    }
  ],
  "reloadSecs": 300
};

log4js.configure(defaultLogProperties);

