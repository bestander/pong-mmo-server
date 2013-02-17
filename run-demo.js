/**
 * A minimal website with pong server module loaded.
 * Just open the page to load the client game javascript and see the application in action.
 *
 * Run it with command "node ./run-demo.js" from project root folder.
 * Requires component(1) tool to be installed (npm install component -g)
 * Requires a client build to be run once ("make install" from demo folder)
 */
/*jshint camelcase:false, indent:2, quotmark:true, nomen:false, onevar:false, passfail:false */
'use strict';

var app = require('http').createServer(handler);
var io = require('socket.io').listen(app);
var fs = require('fs');
var path = require('path');
var pongServer = require('./index.js');

// port to listen
app.listen(5000);

function handler(request, response) {

  console.log('request starting...');

  var filePath = __dirname + request.url;
  if (request.url === '/') {
    filePath += '/demo/index.html';
  }

  var extname = path.extname(filePath);
  var contentType = 'text/html';
  switch (extname) {
  case '.js':
    contentType = 'text/javascript';
    break;
  case '.css':
    contentType = 'text/css';
    break;
  }

  fs.exists(filePath, function (exists) {

    if (exists) {
      fs.readFile(filePath, function (error, content) {
        if (error) {
          response.writeHead(500);
          response.end();
        }
        else {
          response.writeHead(200, { 'Content-Type': contentType });
          response.end(content, 'utf-8');
        }
      });
    }
    else {
      response.writeHead(404);
      response.end();
    }
  });
}

var playerNames = [ 'John', 'Bob', 'Bill'];

io.sockets.on('connection', function (socket) {
  new pongServer.PongSocket(socket, {name: playerNames[Math.floor(Math.random() * 3)], id: Math.floor(Math.random() * 1000 + 1)});
});
