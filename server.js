"use strict";

var express = require('express');
var ejs = require('ejs');
var config = require('./config.js');
var logger = require('log4js').getLogger("main");
var app;
var http = require('http');
var socket = require('socket.io');
var io;

var PongGame = require('pong-box2d');
var WorldSocketSync = require('./game/socket/worldSocketSync.js');

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
  // TODO use compiled front end
});

var port = process.env.PORT;
var server = http.createServer(app);
io = socket.listen(server);
server.listen(port, function () {
  logger.info("server listening on port %d in %s mode", port, app.settings.env);
});


app.get('/', function (req, res) {
  res.render("index.html", {
    facebook_app_id: process.env.FACEBOOK_APP_ID
  });
});

io.sockets.on('connection', function (socket) {
  // create new Game
  // TODO find an available game in the lobby
  var game = new PongGame(300, 300,30);
  game.loop();
  var worldSync = new WorldSocketSync(world);
  worldSync.addSocket(socket);
});

