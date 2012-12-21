/**
 * Game socket class for Pong MMO Server.
 * See documentation at https://github.com/bestander/pong-mmo-www/tree/master/documentation.
 *
 * The object's lifecycle is bound to the socket connection but it does not inherit or depend on some socket implementation.
 * User may pass any socket object to the PongSocket that has methods 'on' and 'emit'
 *
 * The purpose of this class is to coordinate data exchange between game clients and PongGame physics engine.
 * It passes through commands and sends back world updates at regular intervals.
 *
 * License MIT
 * --------
 * Copyright 2012 Konstantin Raev (bestander@gmail.com)
 */
"use strict";
var timers = require('timers');
var _ = require('lodash');

var PongSocket = function (socket){
  // when this class is created the connection already exists
  this._socket = socket;
  if(!game){
    throw new Error("no game provided");
  }
  this._game = game;
  this._sockets = [];
};

PongSocket.prototype.addSocket = function (socket) {
  if(this._sockets.length >= 2){
    throw new Error("two sockets already connected");
  }
  this._defineCommandsHandler(socket);
  this._sockets.push(socket);
  if(this._sockets.length === 1){
    this._game.newGame();
  }
};


PongSocket.prototype._startClientNotificationLoop = function () {
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

PongSocket.prototype._defineCommandsHandler = function (socket) {
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

module.exports = PongSocket;