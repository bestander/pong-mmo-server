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
var pongGameFactory = require('pong-box2d');

function GameLobby () {
  
}

module.exports = new GameLobby();

GameLobby.prototype.getGame = function () {
  return pongGameFactory.create(10, 10);
};
