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
'use strict';

function PongSocket (socket, lobby){
  // when this class is created the connection already exists
  if(socket.disconnected !== false){
    throw new Error('Socket is not connected');
  }
  if(!lobby){
    throw new Error('No game lobby provided');
  }
  this._socket = socket;
  this._lobby = lobby;
  this._game = null;
  this._playerId = null;
  this._defineCommandsHandlers();
}

module.exports = PongSocket;

// world update rate in milliseconds
PongSocket.prototype.GAME_UPDATE_PERIOD_MILLIS = 1000; 

PongSocket.prototype._defineCommandsHandlers = function () {
  var that = this;
  this._socket.on('START_GAME', function () {
    if (!that._isJoinedToGame()) {
      // TODO will be async I'm pretty sure
      that._game = that._lobby.getGame();
      that._playerId = that._game.joinPlayer();
      that._socket.emit('ENTERED_GAME');
    }
  });
  this._socket.on('LAG_CHECK', function () {
    that._socket.emit('LAG_CHECK_RESPONSE', new Date().getTime());
  });
  this._socket.on('READY', function () {
    if (that._isJoinedToGame()) {
      that._game.handlePlayerCommand('READY', that._playerId);
      that._startClientNotificationLoop();
    }
  });
  this._socket.on('disconnect', function () {
    if (that._isJoinedToGame()) {
      that._game.quitPlayer(that._playerId);  
    }
  });

};

PongSocket.prototype._isJoinedToGame = function () {
  return this._game && this._playerId; 
};

PongSocket.prototype._startClientNotificationLoop = function () {
  this._boundLoopCall = this._boundLoopCall || this._startClientNotificationLoop.bind(this);
  
  if(this._isJoinedToGame()){
    this._socket.emit('GAME_UPDATE', {
      'objects': this._game.getObjectPositions(),
      'time': new Date().getTime()
    });
    setTimeout(this._boundLoopCall, this.GAME_UPDATE_PERIOD_MILLIS);

  }
};



