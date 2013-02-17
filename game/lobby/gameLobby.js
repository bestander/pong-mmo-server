/**
 * Game lobby class.
 *
 * It works as a repository of active games, it creates new ones, disposes them and keeps track of available places.
 *
 * License MIT
 * --------
 * Copyright 2012 Konstantin Raev (bestander@gmail.com)
 */
/*jshint camelcase:false, indent:2, quotmark:true, nomen:false, onevar:false, passfail:false */

'use strict';
var pongGameFactory = require('pong-box2d');

var game = pongGameFactory.create(10, 10);

function GameLobby() {

}

module.exports = new GameLobby();

GameLobby.prototype.getGame = function () {
  return game;
};
