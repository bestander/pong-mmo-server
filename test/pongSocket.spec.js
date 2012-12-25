/**
 * Unit tests for game server.
 * Should be run with jasmine-node on server.
 *
 * To execute run 'jasmine-node test --verbose --forceexit' from project root
 */
'use strict';

var PongSocket = require('../game/socket/pongSocket.js');
var EventEmitter = require('events').EventEmitter;
var _ = require('lodash');

// timeout hack for Node.js
jasmine.getGlobal().setTimeout = function(funcToCall, millis) {
  if (jasmine.Clock.installed.setTimeout.apply) {
    return jasmine.Clock.installed.setTimeout.apply(this, arguments);
  } else {
    return jasmine.Clock.installed.setTimeout(funcToCall, millis);
  }
};

describe('Pong Socket class', function () {

  var gameMock = {};
  var socket_io;
  var gameLobbyMock = {};

  beforeEach(function () {
    jasmine.Clock.useMock();

    socket_io = new EventEmitter();
    socket_io.disconnected = false;
    
    spyOn(socket_io, 'emit').andCallThrough();
    
    gameMock = jasmine.createSpyObj('gameMock', ['quitPlayer', 'getEventEmitter', 'handlePlayerCommand']);
    gameMock.joinPlayer = function () {
      // increment player id
      this.playerId = this.playerId || 0;
      this.playerId += 1;
      return this.playerId;
    };
    gameMock.getObjectPositions = function () {
      return {};
    };
    spyOn(gameMock, 'joinPlayer').andCallThrough();
    spyOn(gameMock, 'getObjectPositions').andCallThrough();

    gameLobbyMock.getGame = function () {
      return gameMock;
    };
    spyOn(gameLobbyMock, 'getGame').andCallThrough();
  });

  afterEach(function () {
    socket_io.emit('disconnect');
  });

  it('should throw error if it is created with a socket not in "connected" state', function () {
    socket_io.disconnected = undefined;
    var throwing = function () {
      new PongSocket(socket_io);
    };
    
    expect(throwing).toThrow(new Error('Socket is not connected'));
  });

  it('should expect a game lobby in constructor', function () {
    var throwing = function () {
      new PongSocket(socket_io, undefined);
    };
    expect(throwing).toThrow(new Error('No game lobby provided'));
  });

  describe('when handling client messages', function () {
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

    describe('on "START_GAME"', function () {
      
      it('should request a new game from lobby', function () {
        new PongSocket(socket_io, testLobby);

        runs(function () {
          socket_io.emit('START_GAME');
        });

        waitsFor(function () {
          return lobbyReturnedGame;
        }, 'getGame should have been called', 100);
        
      });

      it('should not request a new game from a lobby twice', function () {
        new PongSocket(socket_io, testLobby);

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

      it('should call game.joinPlayer for the game from lobby', function () {
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

      it('should respond with "ENTERED_GAME" message', function () {
        new PongSocket(socket_io, testLobby);
        socket_io.emit('START_GAME');
        jasmine.Clock.tick(1);
        var response = _.filter(socket_io.emit.calls, function (elem) {
          return elem.args[0] === 'ENTERED_GAME'
        });
        expect(response.length).toBe(1);
        expect(response[0].args.length).toBe(1);
      });
    });

    describe('on "LAG_CHECK"', function () {
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

    describe('on "READY"', function () {
      it('should be ignored if it was called before START_GAME', function () {
        new PongSocket(socket_io, testLobby);
        socket_io.emit('READY');
        expect(gameMock.handlePlayerCommand).not.toHaveBeenCalled();
      });

      it('should pass the ready command to game object', function () {
        new PongSocket(socket_io, testLobby);
        socket_io.emit('START_GAME');
        expect(gameMock.handlePlayerCommand).not.toHaveBeenCalled();
        socket_io.emit('READY');
        var playerId = gameMock.playerId;
        expect(playerId).toEqual(1);
        expect(gameMock.handlePlayerCommand).toHaveBeenCalledWith('READY', playerId);
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

  describe('when joined a game', function () {

    function getUpdateMessages () {
      return _.filter(socket_io.emit.calls, function (elem) {
        return elem.args[0] === 'GAME_UPDATE'
      });
    }

    it('should notify connected client about world object positions at regular time periods', function () {

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

  });


});
