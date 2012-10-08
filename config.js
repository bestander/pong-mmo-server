var fs = require('fs')
  , nconf = require('nconf')
  , log4js = require('log4js')
  , propsExtender = require('./utils/require.extender.js')
;

// configuring log for the whole application
log4js.configure(propsExtender(__dirname + '/properties/log.properties.default.json5', __dirname + '/properties/log.properties.json5'));

nconf.use('memory');

// override config in arguments
nconf.argv();

// default properties can be overridden by instance-specific file
nconf.defaults(propsExtender(__dirname + '/properties/app.properties.default.json5', __dirname + '/properties/app.properties.json5'));

module.exports = function (key) {
    return nconf.get(key);
};