/**
 * Integration test for game socket handler
 * Should be run with jasmine-node on server.
 *
 * To execute 'make test' from project root to run
 */
/*jshint node:true indent:2*/
/*global it:true describe:true expect:true spyOn:true beforeEach:true afterEach:true jasmine:true runs waitsFor*/

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
      var socket = new PongSocket(socket_io);
    };

    expect(throwing).toThrow(new Error('Socket is not connected'));
  });

  describe('should handle client messages', function () {

    describe('"START_GAME"', function () {

      it('and request a new game from lobby', function () {
        expect(gameLobby.getGame).not.toHaveBeenCalled();
        var socket = new PongSocket(socket_io);
        socket_io.emit('START_GAME');
        expect(gameLobby.getGame).toHaveBeenCalled();
      });

      it('and not request a new game from lobby if it was already requested', function () {
        var socket = new PongSocket(socket_io);
        socket_io.emit('START_GAME');
        socket_io.emit('START_GAME');

        expect(gameLobby.getGame.calls.length).toBe(1);
      });

      it('and start listening to the game events', function () {
        var socket = new PongSocket(socket_io);
        socket_io.emit('START_GAME');

        // TODO expect PLAYER_JOINED event to be handled
        expect(true).toBeFalsy();
      });

      it('and call game.joinPlayer', function () {
        var socket = new PongSocket(socket_io, testLobby);

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
          return elem.args[0] === 'GAME_ENTERED';
        });
        expect(response.length).toBe(1);
        expect(response[0].args.length).toBe(2);
        expect(response[0].args[1]).toEqual(fieldParams);
      });
    });

    describe('"LAG_CHECK"', function () {
      it('should return current server time', function () {
        var response;
        socket_io.on('LAG_RESPONSE', function (data) {
          response = data;
        });
        var socket = new PongSocket(socket_io, gameLobbyMock);

        runs(function () {
          socket_io.emit('LAG_CHECK');
        });

        waitsFor(function () {
          return response;
        }, 'Should have responded on LAG_CHECK', 100);

        runs(function () {
          expect(response).toBeCloseTo(new Date().getTime(), -1);
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

    describe('"PLAYER_COMMAND"', function () {
      it('it should be ignored if game was not joined', function () {
        var socket = new PongSocket(socket_io, testLobby);
        socket_io.emit('PLAYER_COMMAND');
        expect(gameMock.handlePlayerCommand).not.toHaveBeenCalled();
      });

      it('it should pass the command to game object', function () {
        var socket = new PongSocket(socket_io, testLobby);
        socket_io.emit('START_GAME');
        expect(gameMock.handlePlayerCommand).not.toHaveBeenCalled();
        var command = {command: 115};
        socket_io.emit('PLAYER_COMMAND', command);
        var playerId = gameMock.playerId;
        expect(playerId).toEqual(1);
        expect(gameMock.handlePlayerCommand).toHaveBeenCalledWith(playerId, command);
      });
    });

    describe('disconnect', function () {

      it('it should call game.quitPlayer', function () {
        var socket = new PongSocket(socket_io, testLobby);
        socket_io.emit('START_GAME');
        expect(gameMock.quitPlayer).not.toHaveBeenCalled();
        socket_io.emit('disconnect');
        expect(gameMock.quitPlayer).toHaveBeenCalledWith(gameMock.playerId);
      });
      it('it should do nothing if no game was joined', function () {
        var socket = new PongSocket(socket_io, testLobby);
        socket_io.emit('disconnect');
        expect(gameMock.quitPlayer).not.toHaveBeenCalled();
      });
    });

  });

  describe('should handle game events', function () {
    it('PLAYER_JOINED, PLAYER_SCORE_CHANGED, PLAYER_QUIT, PLAYER_READY and pass them through to the client', function () {
      expect(true).toBeFalsy();
    });
  });
  describe('receives from Game event', function () {
    describe('PLAYER_JOINED, PLAYER_QUIT, PLAYER_READY, PLAYER_SCORED', function () {
      it('it sends those events to client', function () {
        var messageArgs;
        var message;
        var socket;
        socket = new PongSocket(socket_io, gameLobbyMock);
        socket_io.emit('START_GAME');
      });
    });

    it('GAME_STARTED and send GAME_UPDATE messages to client with game objects positions at regular time periods', function () {
      var message = function () {
        return _.filter(socket_io.emit.calls, function (elem) {
          return elem.args[0] === 'PLAYER_JOINED';
        });
      };
      var messageArgs = {type: 'left', name: 'Bob'};
      expect(message().length).toBe(0);
      gameEvents.emit('PLAYER_JOINED', messageArgs);
      expect(message().length).toBe(1);
      expect(_.last(message()).args[1]).toBe(messageArgs);

      message = function () {
        return _.filter(socket_io.emit.calls, function (elem) {
          return elem.args[0] === 'PLAYER_QUIT';
        });
      };
      messageArgs = {type: 'left'};
      expect(message().length).toBe(0);
      gameEvents.emit('PLAYER_QUIT', messageArgs);
      expect(message().length).toBe(1);
      expect(_.last(message()).args[1]).toBe(messageArgs);

      message = function () {
        return _.filter(socket_io.emit.calls, function (elem) {
          return elem.args[0] === 'PLAYER_READY';
        });
      };
      messageArgs = {type: 'left'};
      expect(message().length).toBe(0);
      gameEvents.emit('PLAYER_READY', messageArgs);
      expect(message().length).toBe(1);
      expect(_.last(message()).args[1]).toBe(messageArgs);

      message = function () {
        return _.filter(socket_io.emit.calls, function (elem) {
          return elem.args[0] === 'PLAYER_SCORED';
        });
      };
      messageArgs = {type: 'left'};
      expect(message().length).toBe(0);
      gameEvents.emit('PLAYER_SCORED', messageArgs);
      expect(message().length).toBe(1);
      expect(_.last(message()).args[1]).toBe(messageArgs);
    });

    describe('MATCH_STARTED', function () {
      it('it sends the event to client', function () {
        var message;
        var socket;
        socket = new PongSocket(socket_io, gameLobbyMock);
        socket_io.emit('START_GAME');

        function getUpdateMessages() {
          return _.filter(socket_io.emit.calls, function (elem) {
            return elem.args[0] === 'GAME_UPDATE';
          });
        }

        message = function () {
          return _.filter(socket_io.emit.calls, function (elem) {
            return elem.args[0] === 'MATCH_STARTED';
          });
        };

        // TODO listen to update
        expect(true).toBeFalsy();
        var socket = new PongSocket(socket_io, gameLobbyMock);

        socket_io.emit('START_GAME');
        jasmine.Clock.tick(socket.GAME_UPDATE_PERIOD_MILLIS * 3);
        expect(message().length).toBe(0);
        gameEvents.emit('MATCH_STARTED');
        expect(message().length).toBe(1);
        expect(_.last(message()).args[1]).toBeUndefined();
      });


      it('starts notifying client about game object positions at regular intervals', function () {
        function getUpdateMessages() {
          return _.filter(socket_io.emit.calls, function (elem) {
            return elem.args[0] === 'GAME_UPDATE';
          });
        }

        jasmine.Clock.tick(socket.GAME_UPDATE_PERIOD_MILLIS);
        var updates = getUpdateMessages();
        expect(updates.length).toEqual(2);
        expect(_.last(updates).args[1].time).toBeDefined();
        expect(_.last(updates).args[1].objects).toBeDefined();
        expect(gameMock.getObjectPositions).toHaveBeenCalled();

        var socket = new PongSocket(socket_io, gameLobbyMock);

        socket_io.emit('START_GAME');
        jasmine.Clock.tick(socket.MATCH_UPDATE_PERIOD_MILLIS * 3);

        expect(getUpdateMessages().length).toEqual(0);
        expect(gameMock.getObjectPositions).not.toHaveBeenCalled();

        gameEvents.emit('MATCH_STARTED');
        expect(getUpdateMessages().length).toEqual(1);
        jasmine.Clock.tick(socket.MATCH_UPDATE_PERIOD_MILLIS - 10);

        jasmine.Clock.tick(socket.MATCH_UPDATE_PERIOD_MILLIS);
        var updates = getUpdateMessages();
        expect(updates.length).toEqual(2);
        expect(_.last(updates).args[1].time).toBeDefined();
        expect(_.last(updates).args[1].objects).toBeDefined();
        expect(gameMock.getObjectPositions).toHaveBeenCalled();
      });
    });

    it('GAME_STOPPED and stop sending periodic GAME_UPDATE messages', function () {
      expect(true).toBeFalsy();
    });
    describe('MATCH_STOPPED', function () {
      it('it sends the event to client', function () {
        var message;
        var socket;
        socket = new PongSocket(socket_io, gameLobbyMock);
        socket_io.emit('START_GAME');

        message = function () {
          return _.filter(socket_io.emit.calls, function (elem) {
            return elem.args[0] === 'MATCH_STOPPED';
          });
        };

        expect(message().length).toBe(0);
        gameEvents.emit('MATCH_STOPPED');
        expect(message().length).toBe(1);
        expect(_.last(message()).args[1]).toBeUndefined();
      });

      it('stops notifying client about game object positions at regular intervals', function () {
        function getUpdateMessages() {
          return _.filter(socket_io.emit.calls, function (elem) {
            return elem.args[0] === 'GAME_UPDATE';
          });
        }

        var socket = new PongSocket(socket_io, gameLobbyMock);

        socket_io.emit('START_GAME');
        jasmine.Clock.tick(socket.MATCH_UPDATE_PERIOD_MILLIS * 3);

        expect(getUpdateMessages().length).toEqual(0);
        expect(gameMock.getObjectPositions).not.toHaveBeenCalled();

        gameEvents.emit('MATCH_STARTED');
        expect(getUpdateMessages().length).toEqual(1);
        jasmine.Clock.tick(socket.MATCH_UPDATE_PERIOD_MILLIS - 10);

        jasmine.Clock.tick(socket.MATCH_UPDATE_PERIOD_MILLIS);
        var updates = getUpdateMessages();
        expect(updates.length).toEqual(2);
        expect(_.last(updates).args[1].time).toBeDefined();
        expect(_.last(updates).args[1].objects).toBeDefined();
        expect(gameMock.getObjectPositions).toHaveBeenCalled();

        gameEvents.emit('MATCH_STOPPED');
        expect(getUpdateMessages().length).toEqual(2);
        jasmine.Clock.tick(socket.MATCH_UPDATE_PERIOD_MILLIS * 5);
        expect(getUpdateMessages().length).toEqual(2);

      });
    });

  });

});
