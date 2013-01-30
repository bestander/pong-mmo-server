/**
 * Game lobby unit tests
 * To execute run 'jasmine-node test --verbose --forceexit' from project root
 */
'use strict';

var gameLobby = require('../game/lobby/gameLobby.js');


describe('Game Lobby class', function () {
  
  it("should create a new game when getGame command is called", function () {
    var game = gameLobby.getGame();
    expect(game).toBeDefined();
    var game2 = gameLobby.getGame();
    expect(game2).toBeDefined();
    expect(game).not.toBe(game2);

  });
});
