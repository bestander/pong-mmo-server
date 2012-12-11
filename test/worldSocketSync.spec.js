var GameSync = require('../game/socket/gameSocketSync.js');

describe('Game sync module', function () {

  var gameMock = {};
  var firstSocket = {};
  var secondSocket = {};

  beforeEach(function () {
    gameMock = jasmine.createSpyObj('gameMock', ['newGame']);
    firstSocket = jasmine.createSpyObj('firstSocket', ['emit', 'on']);
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

  });

  it('should notify game if one socket is closed and the other is still connected', function () {

  });

  it('should stop the game if no sockets are connected', function () {

  });

  it('should periodically notify connected sockets about world state', function () {

  });

  describe('should pass through to game object sockets command', function () {
    it('move', function () {

    });

  });

});
