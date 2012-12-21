/**
 * Unit tests for game server.
 * Should be run with jasmine-node on server.
 *
 * To execute run 'jasmine-node --verbose test' from project root
 */
"use strict";

var PongSocket = require('../game/socket/gameSocket.js');
var EventEmitter = require("events").EventEmitter;

describe('Pong Socket class', function () {

  var gameMock = {};
  var socket_io;
  var gameLobbyMock = {};
  
  beforeEach(function () {
    socket_io = new EventEmitter();
    socket_io.disconnected = false;
    gameMock = jasmine.createSpyObj('gameMock', ['joinPlayer', 'quitPlayer', 'getEventEmitter', 'handlePlayerCommand', 'getGameObjectPositions']);

    gameLobbyMock.getGame = function () {
      return gameMock;
    };
    spyOn(gameLobbyMock, "getGame").andCallThrough();
  });

  it('should throw error if it is created with a socket not in "connected" state', function () {
    socket_io.disconnected = undefined;
    var throwing = function () {
      new PongSocket(socket_io);
    };
    
    expect(throwing).toThrow(new Error("Socket is not connected"));
  });

  it("should expect a game lobby in constructor", function () {
    var throwing = function () {
      new PongSocket(socket_io, undefined);
    };
    expect(throwing).toThrow(new Error("No game lobby provided"));
  });

  describe("when handling client messages", function () {
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

    describe("on 'START_GAME'", function () {
      
      it("should request a new game from lobby", function () {
        new PongSocket(socket_io, testLobby);

        runs(function () {
          socket_io.emit("START_GAME");
        });

        waitsFor(function () {
          return lobbyReturnedGame;
        }, "getGame should have been called", 100);
        
      });

      it("should not request a new game from a lobby twice", function () {
        new PongSocket(socket_io, testLobby);

        runs(function () {
          socket_io.emit("START_GAME");
          socket_io.emit("START_GAME");
        });

        waitsFor(function () {
          return lobbyReturnedGame;
        }, "getGame should have been called", 100);

        runs(function () {
          expect(testLobby.getGame.calls.length).toEqual(1);
        });
      });

      it("should call game.joinPlayer for the game from lobby", function () {
        new PongSocket(socket_io, testLobby);

        runs(function () {
          socket_io.emit("START_GAME");
        });

        waitsFor(function () {
          return lobbyReturnedGame;
        }, "getGame should have been called", 100);
        
        runs(function () {
          expect(gameMock.joinPlayer).toHaveBeenCalled();
        });
        
      });
    });

    describe("on 'LAG_CHECK'", function () {
      it("should return current server time", function () {
        var response;
        socket_io.on("LAG_CHECK_RESPONSE", function (data) {
          response = data;
        });
        new PongSocket(socket_io, gameLobbyMock);

        runs(function () {
          socket_io.emit("LAG_CHECK");
        });

        waitsFor(function () {
          return response;
        }, "Should have responded on LAG_CHECK", 100);

        runs(function () {
          expect(response / 100).toBeCloseTo(new Date().getTime() / 100, 0);
        });

      });  
    });

    describe("on 'READY'", function () {
      it("the message should be ignored if it was called before START_GAME", function () {
            
      });

      it("should pass the ready command to game object", function () {
        new PongSocket(socket_io, testLobby);

        runs(function () {
          socket_io.emit("START_GAME");
        });

        waitsFor(function () {
          return lobbyReturnedGame;
        }, "getGame should have been called", 100);

        runs(function () {
          // TODO get player id
          var playerId;
          socket_io.emit("READY", playerId);
          expect(true).toBeFalsy();
        });

      });
    });

    // TODO on disconnect
    
    // TODO periodic world state update

    
    
  });



});
