/**
 * Game lobby class.
 * 
 * It works as a repository of active games, it creates new ones, disposes them and keeps track of available places.
 * 
 * License MIT
 * --------
 * Copyright 2012 Konstantin Raev (bestander@gmail.com)
 */
'use strict';
var PongGame = require('pong-box2d');

function GameLobby () {
  
}

module.exports = GameLobby;

GameLobby.prototype.getGame = function () {
  return new PongGame();
};
