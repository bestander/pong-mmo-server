/**
 * Socket sync class that keeps all connected clients in sync with the current world
 */
"use strict";
var timers = require('timers');
var _ = require('lodash');

var GameSocketSync = function (game, notificationPeriod){
  if(!game){
    throw new Error("no game provided");
  }
  this._game = game;
  this._sockets = [];
};

GameSocketSync.prototype.addSocket = function (socket) {
  if(this._sockets.length >= 2){
    throw new Error("two sockets already connected");
  }
  this._defineCommandsHandler(socket);
  this._sockets.push(socket);
  if(this._sockets.length === 1){
    this._game.newGame();
  }
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
    // TODO
  });
  socket.on("LAG_CHECK", function (data) {
    socket.emit({serverTime: new Date().getTime(), id: data.id});
  });
  socket.on('disconnect', function () {
    var index = that._sockets.indexOf(socket);
    that._game.playerQuit(index + 1);
    that._sockets.splice(index, 1);
  });
};

module.exports = GameSocketSync;