/**
 * Game lobby unit tests
 * To execute run 'jasmine-node test --verbose --forceexit' from project root
 */
'use strict';

var GameLobby = require('../game/lobby/gameLobby.js');


describe('Game Lobby class', function () {
  
  it("should create a new game when getGame command is called", function () {
    var lobby = new GameLobby();
    var game = lobby.getGame();
    expect(game).toBeDefined();
    var game2 = lobby.getGame();
    expect(game2).toBeDefined();
    expect(game).not.toBe(game2);

  });
});
