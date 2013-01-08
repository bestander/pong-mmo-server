/**
 * Unit tests for game server.
 * Should be run with jasmine-node on server.
 *
 * To execute run 'jasmine-node test --verbose --forceexit' from project root
 */
/*jshint node:true indent:2*/
/*global it:true describe:true expect:true spyOn:true beforeEach:true afterEach:true jasmine:true runs waitsFor*/

'use strict';

var PongSocket = require('../game/socket/pongSocket.js');
var EventEmitter = require('events').EventEmitter;
var _ = require('lodash');

// timeout hack for Node.js
jasmine.getGlobal().setTimeout = function (funcToCall, millis) {
  if (jasmine.Clock.installed.setTimeout.apply) {
    return jasmine.Clock.installed.setTimeout.apply(this, arguments);
  } else {
    return jasmine.Clock.installed.setTimeout(funcToCall, millis);
  }
};

describe('When Pong Socket', function () {

  var gameMock = {};
  var socket_io;
  var gameLobbyMock = {};
  var fieldParams = {'gameParams': 'mock'};
  var gameEvents;

  beforeEach(function () {

    jasmine.Clock.useMock();

    socket_io = new EventEmitter();
    socket_io.disconnected = false;

    spyOn(socket_io, 'emit').andCallThrough();

    gameMock = jasmine.createSpyObj('gameMock', ['quitPlayer', 'joinPlayer', 'getEventEmitter', 'handlePlayerCommand',
      'getObjectPositions', 'getFieldParams']);

    gameMock.joinPlayer.andCallFake(function () {
      // increment player id
      this.playerId = this.playerId || 0;
      this.playerId += 1;
      return this.playerId;
    });
    gameMock.getObjectPositions.andCallFake(function () {
      return {};
    });
    gameMock.getFieldParams.andCallFake(function () {
      return fieldParams;
    });
    gameEvents = new EventEmitter();
    gameMock.getEventEmitter.andReturn(gameEvents);


    gameLobbyMock.getGame = function () {
      return gameMock;
    };
    spyOn(gameLobbyMock, 'getGame').andCallThrough();
  });

  afterEach(function () {
    socket_io.emit('disconnect');
  });

  describe('is created', function () {
    it('it should throw error if socket is not in "connected" state or lobby is missing', function () {
      socket_io.disconnected = undefined;
      var throwing = function () {
        var socket = new PongSocket(socket_io, gameLobbyMock);
      };
      expect(throwing).toThrow(new Error('Socket is not connected'));
      socket_io.disconnected = false;
      throwing = function () {
        var socket = new PongSocket(socket_io, undefined);
      };
      expect(throwing).toThrow(new Error('No game lobby provided'));
    });

  });


  describe('receives from client message', function () {
    var testLobby;
    var lobbyReturnedGame;

    beforeEach(function () {
      testLobby = {
        getGame: function () {
        }
      };
      lobbyReturnedGame = false;
      spyOn(testLobby, 'getGame').andCallFake(function () {
        lobbyReturnedGame = true;
        return gameMock;
      });
    });

    describe('"START_GAME"', function () {

      it('it should request a new game from lobby', function () {
        var socket = new PongSocket(socket_io, testLobby);

        runs(function () {
          socket_io.emit('START_GAME');
        });

        waitsFor(function () {
          return lobbyReturnedGame;
        }, 'getGame should have been called', 100);

      });

      it('it should ignore second START_GAME a new game was requested already', function () {
        var socket = new PongSocket(socket_io, testLobby);

        runs(function () {
          socket_io.emit('START_GAME');
          socket_io.emit('START_GAME');
        });

        waitsFor(function () {
          return lobbyReturnedGame;
        }, 'getGame should have been called', 100);

        runs(function () {
          expect(testLobby.getGame.calls.length).toEqual(1);
        });
      });

      it('it should call game.joinPlayer for the returned game from lobby', function () {
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

      it('it should respond with "GAME_ENTERED" message with field dimensions', function () {
        var socket = new PongSocket(socket_io, testLobby);
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
      it('it should return current server time', function () {
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

    describe('"READY"', function () {
      it('it should be ignored if game was not joined', function () {
        var socket = new PongSocket(socket_io, testLobby);
        socket_io.emit('READY');
        expect(gameMock.handlePlayerCommand).not.toHaveBeenCalled();
      });

      it('it should pass the "ready" command to game object', function () {
        var socket = new PongSocket(socket_io, testLobby);
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

  describe('receives from Game event', function () {
    describe('PLAYER_JOINED, PLAYER_QUIT, PLAYER_READY, PLAYER_SCORED', function () {
      it('it sends those events to client', function () {
        var messageArgs;
        var message;
        var socket;
        socket = new PongSocket(socket_io, gameLobbyMock);
        socket_io.emit('START_GAME');

        message = function () {
          return _.filter(socket_io.emit.calls, function (elem) {
            return elem.args[0] === 'PLAYER_JOINED';
          });
        };
        messageArgs = {type: 'left', name: 'Bob'};
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
    });
    describe('MATCH_STARTED', function () {
      it('it sends the event to client', function () {
        var message;
        var socket;
        socket = new PongSocket(socket_io, gameLobbyMock);
        socket_io.emit('START_GAME');

        message = function () {
          return _.filter(socket_io.emit.calls, function (elem) {
            return elem.args[0] === 'MATCH_STARTED';
          });
        };

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
