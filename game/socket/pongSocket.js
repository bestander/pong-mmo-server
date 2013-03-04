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
/*jshint camelcase:false, indent:2, quotmark:true, nomen:false, onevar:false, passfail:false */
'use strict';
var lobby = require('../lobby/gameLobby.js');

function PongSocket(socket, player) {
  // when this class is created the connection already exists
  if (socket.disconnected !== false) {
    throw new Error('Socket is not connected');
  }
  if (!player || !player.id) {
    throw new Error('Expecting player argument with unique id');
  }
  this._socket = socket;
  this._game = null;
  this._player = player;
  this._matchStarted = false;
  this._defineCommandsHandlers();
}

module.exports = PongSocket;

// match update rate in milliseconds
PongSocket.prototype.MATCH_UPDATE_PERIOD_MILLIS = 100;

PongSocket.prototype._defineCommandsHandlers = function () {
  var that = this;
  this._socket.on('START_GAME', function () {
    if (!that._isJoinedToGame()) {
      that._game = lobby.getGame();
      that._game.joinPlayer(that._player);
      that._socket.emit('ENTERED_GAME', that._game.getParametersAndState());
      that._defineGameEventsHandlers();
    }
  });
  this._socket.on('LAG_CHECK', function () {
    that._socket.emit('LAG_RESPONSE', new Date().getTime());
  });
  this._socket.on('PLAYER_COMMAND', function (data) {
    if (that._isJoinedToGame()) {
      that._game.handlePlayerCommand(that._player.id, data);
    }
  });
  this._socket.on('disconnect', function () {
    if (that._isJoinedToGame()) {
      that._game.quitPlayer(that._player.id);
    }
  });
};

/**
 * pipe specific events from source event emitter to destination event emitter
 * @param source event emitter
 * @param destination event emitter
 * @param event event name
 */
function pipeEvents(source, destination, event) {
  source.on(event, function (data) {
    destination.emit(event, data);
  });
}

PongSocket.prototype._defineGameEventsHandlers = function () {
  var that = this;
  pipeEvents(this._game.getEventsEmitter(), this._socket, 'PLAYER_JOINED');
  pipeEvents(this._game.getEventsEmitter(), this._socket, 'PLAYER_QUIT');
  pipeEvents(this._game.getEventsEmitter(), this._socket, 'PLAYER_READY');
  pipeEvents(this._game.getEventsEmitter(), this._socket, 'PLAYER_SCORE_CHANGED');
  pipeEvents(this._game.getEventsEmitter(), this._socket, 'MATCH_STARTED');
  pipeEvents(this._game.getEventsEmitter(), this._socket, 'MATCH_STOPPED');
  this._game.getEventsEmitter().on('MATCH_STARTED', function () {
    that._matchStarted = true;
    that._startClientNotificationLoop();
  });
  this._game.getEventsEmitter().on('MATCH_STOPPED', function () {
    that._matchStarted = false;
  });
};

PongSocket.prototype._isJoinedToGame = function () {
  return this._game && this._player;
};

PongSocket.prototype._isMatchStarted = function () {
  return this._isJoinedToGame() && this._matchStarted;
};

PongSocket.prototype._startClientNotificationLoop = function () {
  this._boundLoopCall = this._boundLoopCall || this._startClientNotificationLoop.bind(this);
  
  if (this._isMatchStarted()) {
    this._socket.emit('MATCH_UPDATE', {
      'objects': this._game.getBallAndPaddlePositions(),
      'time': new Date().getTime()
    });
    setTimeout(this._boundLoopCall, PongSocket.prototype.MATCH_UPDATE_PERIOD_MILLIS);
  }
};



