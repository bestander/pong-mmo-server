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

var PongSocket = function (socket, lobby){
  // when this class is created the connection already exists
  if(socket.disconnected !== false){
    throw new Error("Socket is not connected");
  }
  if(!lobby){
    throw new Error("No game lobby provided");
  }
  this._socket = socket;
  this._lobby = lobby;
  this._game = null;
  this._playerId = null;
  this._defineCommandsHandlers();
};

module.exports = PongSocket;

PongSocket.prototype._defineCommandsHandlers = function () {
  var that = this;
  this._socket.on("START_GAME", function () {
    if(!that._game) {
      that._game = that._lobby.getGame();
      that._playerId = that._game.joinPlayer();
    }
  });
  this._socket.on("LAG_CHECK", function () {
    that._socket.emit("LAG_CHECK_RESPONSE", new Date().getTime());
  });

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



