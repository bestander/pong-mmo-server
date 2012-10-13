var express = require('express')
  , ejs = require('ejs')
  , config = require('./config.js')
  , logger = require('log4js').getLogger("main")
  , app
  ;

app = express();

// Configuration
app.use(express.static(__dirname + '/www'));
app.use(express.cookieParser());
// TODO generate UID
app.use(express.session({ secret: "server has no secrets" }));
app.set('views', __dirname + '/www/html');
app.engine('html', ejs.renderFile);

app.configure('development', function () {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function () {
  app.use(express.errorHandler());
});

app.get('/', function (req, res) {
  res.render("index.html", {
    facebook_app_id: config("FACEBOOK_APP_ID")
  });
});

var port = config('PORT');
app.listen(port, function () {
  logger.info("server listening on port %d in %s mode", port, app.settings.env);
});
