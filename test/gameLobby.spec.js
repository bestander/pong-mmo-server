/**
 * Game lobby unit tests
 * To execute run 'jasmine-node test --verbose --forceexit' from project root
 */
/*jshint camelcase:false, indent:2, quotmark:true, nomen:false, onevar:false, passfail:false */
/*global it:true describe:true expect:true spyOn:true beforeEach:true afterEach:true jasmine:true runs waitsFor*/
'use strict';


var gameLobby = require('../game/lobby/gameLobby.js');


describe('Game Lobby class', function () {
  
  it('should return only one game becuase the functionality is not finished', function () {
    var game = gameLobby.getGame();
    expect(game).toBeDefined();
    var game2 = gameLobby.getGame();
    expect(game2).toBeDefined();
    expect(game).toBe(game2);

  });
});
