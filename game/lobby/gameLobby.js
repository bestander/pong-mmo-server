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

var GAME_WIDTH = 400;
var GAME_HEIGHT = 400;
var GAME_SCALE = 30;

function GameLobby () {
  
}

module.exports = GameLobby;

GameLobby.prototype.getGame = function () {
  return new PongGame(GAME_WIDTH, GAME_HEIGHT, GAME_SCALE);
};
