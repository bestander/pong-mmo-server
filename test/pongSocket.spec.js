/**
 * Integration test for game socket handler
 * Should be run with jasmine-node on server.
 *
 * To execute 'make test' from project root to run
 */
'use strict';

var _ = require('lodash');
var jasmine_node_sugar = require('jasmine-node-sugar');
var PongSocket = require('../game/socket/pongSocket.js');
var EventEmitter = require('events').EventEmitter;


describe('Pong Socket class', function () {

  var gameLobby;
  var game;
  var socket_io;

  beforeEach(function () {
    jasmine.Clock.useMock();

    socket_io = new EventEmitter();
    socket_io.disconnected = false;
    spyOn(socket_io, 'emit').andCallThrough();

    gameLobby = require('../game/lobby/gameLobby.js');
    spyOn(gameLobby, 'getGame').andCallThrough();
  });

  it('should throw error if it is created with a socket not in "connected" state', function () {
    socket_io.disconnected = undefined;
    var throwing = function () {
      new PongSocket(socket_io);
    };
    
    expect(throwing).toThrow(new Error('Socket is not connected'));
  });

  describe('should handle client messages', function () {

    describe('"START_GAME"', function () {
      
      it('and request a new game from lobby', function () {
        expect(gameLobby.getGame).not.toHaveBeenCalled();
        new PongSocket(socket_io);
        socket_io.emit('START_GAME');
        expect(gameLobby.getGame).toHaveBeenCalled();
      });

      it('and not request a new game from lobby if it was already requested', function () {
        new PongSocket(socket_io);
        socket_io.emit('START_GAME');
        socket_io.emit('START_GAME');

        expect(gameLobby.getGame.calls.length).toBe(1);
      });

      it('and start listening to the game events', function () {
        new PongSocket(socket_io);
        socket_io.emit('START_GAME');

        // TODO expect PLAYER_JOINED event to be handled
        expect(true).toBeFalsy();
      });

      it('and call game.joinPlayer', function () {
        new PongSocket(socket_io, testLobby);

        runs(function () {
          socket_io.emit('START_GAME');
        });

        waitsFor(function () {
          return lobbyReturnedGame;
        }, 'getGame should have been called', 100);
        
        runs(function () {
          expect(gameMock.joinPlayer).toHaveBeenCalled();
        });
        
      });

      it('and respond with "ENTERED_GAME" message which contains game dimensions and player list', function () {
        new PongSocket(socket_io, testLobby);
        socket_io.emit('START_GAME');
        jasmine.Clock.tick(1);
        var response = _.filter(socket_io.emit.calls, function (elem) {
          return elem.args[0] === 'ENTERED_GAME'
        });
        expect(response.length).toBe(1);
        expect(response[0].args.length).toBe(2);
        expect(response[0].args[1]).toEqual({'gameParams': 'mock'});
      });
    });

    describe('"LAG_CHECK"', function () {
      it('should return current server time', function () {
        var response;
        socket_io.on('LAG_CHECK_RESPONSE', function (data) {
          response = data;
        });
        new PongSocket(socket_io, gameLobbyMock);

        runs(function () {
          socket_io.emit('LAG_CHECK');
        });

        waitsFor(function () {
          return response;
        }, 'Should have responded on LAG_CHECK', 100);

        runs(function () {
          expect(response / 100).toBeCloseTo(new Date().getTime() / 100, 0);
        });

      });  
    });

    describe('"GAME_COMMAND"', function () {
      it('should be ignored if it was called before joining a game', function () {
        new PongSocket(socket_io, testLobby);
        socket_io.emit('READY');
        expect(gameMock.handlePlayerCommand).not.toHaveBeenCalled();
      });

      it('should pass the command to game object', function () {
        new PongSocket(socket_io, testLobby);
        socket_io.emit('START_GAME');
        expect(gameMock.handlePlayerCommand).not.toHaveBeenCalled();
        socket_io.emit('READY');
        var playerId = gameMock.playerId;
        expect(playerId).toEqual(1);
        expect(gameMock.handlePlayerCommand).toHaveBeenCalledWith(playerId, 'READY');
      });
    });

    describe('on disconnect', function () {

      it('should call game.quitPlayer', function () {
        new PongSocket(socket_io, testLobby);
        socket_io.emit('START_GAME');
        expect(gameMock.quitPlayer).not.toHaveBeenCalledWith(gameMock.playerId);
        socket_io.emit('disconnect');
        expect(gameMock.quitPlayer).toHaveBeenCalledWith(gameMock.playerId);
      });
    });

  });

  describe('should handle game events', function () {
    it('PLAYER_JOINED, PLAYER_SCORE_CHANGED, PLAYER_QUIT, PLAYER_READY and pass them through to the client', function () {
      expect(true).toBeFalsy();
    });

    it('GAME_STARTED and send GAME_UPDATE messages to client with game objects positions at regular time periods', function () {

      function getUpdateMessages () {
        return _.filter(socket_io.emit.calls, function (elem) {
          return elem.args[0] === 'GAME_UPDATE'
        });
      }

      // TODO listen to update
      expect(true).toBeFalsy();
      var socket = new PongSocket(socket_io, gameLobbyMock);

      socket_io.emit('START_GAME');
      jasmine.Clock.tick(socket.GAME_UPDATE_PERIOD_MILLIS * 3);

      expect(getUpdateMessages().length).toEqual(0);
      expect(gameMock.getObjectPositions).not.toHaveBeenCalled();
      socket_io.emit('READY');

      expect(getUpdateMessages().length).toEqual(1);
      jasmine.Clock.tick(socket.GAME_UPDATE_PERIOD_MILLIS - 10);

      jasmine.Clock.tick(socket.GAME_UPDATE_PERIOD_MILLIS);
      var updates = getUpdateMessages();
      expect(updates.length).toEqual(2);
      expect(_.last(updates).args[1].time).toBeDefined();
      expect(_.last(updates).args[1].objects).toBeDefined();
      expect(gameMock.getObjectPositions).toHaveBeenCalled();

    });

    it('GAME_STOPPED and stop sending periodic GAME_UPDATE messages', function () {
      expect(true).toBeFalsy();
    });
  });

});
