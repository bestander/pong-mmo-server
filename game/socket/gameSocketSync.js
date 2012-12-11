/**
 * Socket sync class that keeps all connected clients in sync with the current world
 */
"use strict";
var timers = require('timers');

var GameSocketSync = function (game, notificationPeriod){
  if(!game){
    throw new Error("no game provided");
  }
  this._game = game;
  this._sockets = [];
  this._startClientNotificationLoop();
};

GameSocketSync.prototype.addSocket = function (socket) {
  if(this._sockets.length >= 2){
    throw new Error("two sockets already connected");
  }
  this._defineCommandsHandler(socket);
  this._sockets.push(socket);
  this._game.newGame();
};


GameSocketSync.prototype._startClientNotificationLoop = function () {
  // TODO every X seconds for all this._sockets send current world state
  // this._world.getBodyPositions();
  for(var i = 0; i < this._sockets.length; i+=1){
    this._sockets[i].emit("WORLD_UPDATE", {
      serverTime: new Date().getTime(),
      ball: {
        position: {x:1, y:1}
      },
      players: [
        {
          position: {x:22, y:1}
        },
        {
          position: {x:1, y:33}
        }
      ]
    });
  }
  timers.setTimeout(this._startClientNotificationLoop.bind(this), 2000);
};

GameSocketSync.prototype._defineCommandsHandler = function (socket) {
  var that = this;
  socket.on("PLAYER_COMMAND", function (data) {
    console.log("Player sent command %s", data)
    // TODO that._world.movePaddle(...)
  });
  socket.on("LAG_CHECK", function (data) {
    // TODO send current time
    socket.emit({serverTime: new Date().getTime(), id: data.id});
  });
  socket.on('disconnect', function () {
    // TODO remove socket from the list
  });
};

module.exports = GameSocketSync;