var GameSync = require('../game/socket/gameSocketSync.js');
var EventEmitter = require("events").EventEmitter;

describe('Game sync module', function () {

  var gameMock = {};
  var firstSocket;
  var secondSocket;

  beforeEach(function () {
    gameMock = jasmine.createSpyObj('gameMock', ['playerQuit', 'playerJoined']);
    firstSocket = new EventEmitter();
    secondSocket = new EventEmitter();
    spyOn(firstSocket, 'emit').andCallThrough();
    spyOn(secondSocket, 'emit').andCallThrough();
  });

  it('should fail if game object is undefined', function () {
    var failing = function () {
      var sync = new GameSync();
    };
    expect(failing).toThrow(new Error("no game provided"));
  });

  it('should start a new game when first connection is added', function () {
    var sync = new GameSync(gameMock);
    sync.addSocket(firstSocket);
    expect(gameMock.newGame).toHaveBeenCalled();
  });

  it('should allow only a second socket to be added to an existing game ', function () {
    var sync = new GameSync(gameMock);
    sync.addSocket(firstSocket);
    sync.addSocket(firstSocket);

    var fail = function () {
      sync.addSocket(firstSocket);
    };
    expect(fail).toThrow(new Error('two sockets already connected'));
  });

  it('should not trigger new game if second socket is added', function () {
    var sync = new GameSync(gameMock);
    sync.addSocket(firstSocket);
    expect(gameMock.newGame).toHaveBeenCalled();
    expect(gameMock.newGame.calls.length).toEqual(1);
    sync.addSocket(firstSocket);
    expect(gameMock.newGame.calls.length).toEqual(1);
  });

  it('should notify the game about which player quit when socket closes', function () {
    var sync = new GameSync(gameMock);
    sync.addSocket(firstSocket);
    sync.addSocket(secondSocket);

    runs(function () {
      secondSocket.emit('disconnect', "");
    });

    waitsFor(function () {
      return gameMock.playerQuit.callCount === 1;
    }, 'Socket 2 should have disconnected', 100);

    runs(function () {
      expect(gameMock.playerQuit).toHaveBeenCalledWith(2);
      sync.addSocket(secondSocket);
      firstSocket.emit('disconnect');
    });

    waitsFor(function () {
      return gameMock.playerQuit.callCount === 2;
    }, 'Socket 1 should have disconnected', 100);

    runs(function () {
      expect(gameMock.playerQuit).toHaveBeenCalledWith(1);
    });

  });

  it('should stop the game if no sockets are connected', function () {
    var sync = new GameSync(gameMock);
    sync.addSocket(firstSocket);
    sync.addSocket(secondSocket);
    runs(function () {
      firstSocket.emit('disconnect', "");
      secondSocket.emit('disconnect', "");
    });

    waitsFor(function () {
      return gameMock.stopGame.callCount === 2;
    }, 'Game should have been stopped', 100);

  });

  it('should periodically notify connected sockets about world state', function () {

  });

  describe('should pass through to game object sockets command', function () {
    it('move', function () {

    });

  });

});
