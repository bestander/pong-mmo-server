/**
 * Integration test for game socket handler
 * Should be run with jasmine-node on server.
 *
 * To execute 'make test' from project root to run
 */
/*jshint camelcase:false, indent:2, quotmark:true, nomen:false, onevar:false, passfail:false */
/*global it:true describe:true expect:true spyOn:true beforeEach:true afterEach:true jasmine:true runs waitsFor*/

'use strict';

var _ = require('lodash');
var jns = require('jasmine-node-sugar');
var PongSocket = require('../game/socket/pongSocket.js');
var EventEmitter = require('events').EventEmitter;


describe('Pong Socket class', function () {

  var gameLobby, game, socket_io;

  beforeEach(function () {
    jasmine.Clock.useMock();

    socket_io = new EventEmitter();
    socket_io.disconnected = false;
    spyOn(socket_io, 'emit').andCallThrough();

    gameLobby = require('../game/lobby/gameLobby.js');
    game = gameLobby.getGame();
    spyOn(gameLobby, 'getGame').andReturn(game);
  });

  it('should throw error if it is created with a socket not in "connected" state', function () {
    socket_io.disconnected = undefined;
    var throwing = function () {
      new PongSocket(socket_io, {id: '123'});
    };

    expect(throwing).toThrow(new Error('Socket is not connected'));
  });

  it('should be created with a player object passed as argument which has id property', function () {
    var throwing;
    
    throwing = function () {
      new PongSocket(socket_io);
    };
    expect(throwing).toThrow(new Error('Expecting player argument with unique id'));

    throwing = function () {
      new PongSocket(socket_io, {});
    };
    expect(throwing).toThrow(new Error('Expecting player argument with unique id'));

    new PongSocket(socket_io, {id: '123'});
  });

  describe('should handle client messages', function () {

    describe('"START_GAME"', function () {

      it('and request a new game from lobby', function () {
        expect(gameLobby.getGame).not.toHaveBeenCalled();
        new PongSocket(socket_io, {id: '123'});
        socket_io.emit('START_GAME');
        expect(gameLobby.getGame).toHaveBeenCalled();
      });

      it('and not request a new game from lobby if it was already requested', function () {
        new PongSocket(socket_io, {id: '123'});
        socket_io.emit('START_GAME');
        socket_io.emit('START_GAME');

        expect(gameLobby.getGame.calls.length).toBe(1);
      });

      it('and call game.joinPlayer', function () {
        new PongSocket(socket_io, {id: '123'});
        spyOn(game, 'joinPlayer').andCallThrough();
        expect(game.joinPlayer).not.toHaveBeenCalled();
        socket_io.emit('START_GAME');
        expect(game.joinPlayer).toHaveBeenCalled();
      });

      it('and respond with "ENTERED_GAME" message which contains game dimensions and player list', function () {
        new PongSocket(socket_io, {id: '123'});
        expect(jns.getCallsFilteredByFirstArg(socket_io.emit.calls, 'ENTERED_GAME').length).toBe(0);
        socket_io.emit('START_GAME');
        expect(jns.getCallsFilteredByFirstArg(socket_io.emit.calls, 'ENTERED_GAME').length).toBe(1);
        expect(jns.getCallsFilteredByFirstArg(socket_io.emit.calls, 'ENTERED_GAME')[0].args[1]).toEqual(game.getParametersAndState());
      });
    });

    describe('"LAG_CHECK"', function () {
      it('should return current server time', function () {
        new PongSocket(socket_io, {id: '123'});
        expect(jns.getCallsFilteredByFirstArg(socket_io.emit.calls, 'LAG_RESPONSE').length).toBe(0);
        socket_io.emit('LAG_CHECK');
        expect(jns.getCallsFilteredByFirstArg(socket_io.emit.calls, 'LAG_RESPONSE').length).toBe(1);
        expect(jns.getCallsFilteredByFirstArg(socket_io.emit.calls, 'LAG_RESPONSE')[0].args[1]).toBeCloseTo(new Date().getTime(), -1);
      });
    });

    describe('"PLAYER_COMMAND"', function () {
      it('should be ignored if it was called before joining a game', function () {
        spyOn(game, 'handlePlayerCommand').andCallThrough();
        new PongSocket(socket_io, {id: '123'});
        socket_io.emit('READY');
        expect(game.handlePlayerCommand).not.toHaveBeenCalled();
      });

      it('should pass the command to game object', function () {
        var playerId;

        spyOn(game, 'handlePlayerCommand').andCallThrough();
        spyOn(game, 'joinPlayer').andCallThrough();

        new PongSocket(socket_io, {id: '123'});
        socket_io.emit('START_GAME');
        playerId = game.joinPlayer.mostRecentCall.args[0].id;

        expect(game.handlePlayerCommand).not.toHaveBeenCalled();
        socket_io.emit('PLAYER_COMMAND', 'READY');
        expect(game.handlePlayerCommand).toHaveBeenCalledWith(playerId, 'READY');
      });
    });

    describe('disconnect', function () {

      it('it should call game.quitPlayer', function () {
        var playerId;
        new PongSocket(socket_io, {id: '123'});

        spyOn(game, 'quitPlayer').andCallThrough();
        spyOn(game, 'joinPlayer').andCallThrough();

        socket_io.emit('START_GAME');
        playerId = game.joinPlayer.mostRecentCall.args[0].id;

        expect(game.quitPlayer).not.toHaveBeenCalled();
        socket_io.emit('disconnect');
        expect(game.quitPlayer).toHaveBeenCalledWith(playerId);
      });
      
      it('it should do nothing if no game was joined', function () {
        spyOn(game, 'quitPlayer').andCallThrough();
        new PongSocket(socket_io, {id: '123'});
        socket_io.emit('disconnect');
        expect(game.quitPlayer).not.toHaveBeenCalled();
      });
    });

  });

  describe('should handle game events', function () {
    it('PLAYER_JOINED, PLAYER_SCORE_CHANGED, PLAYER_QUIT, PLAYER_READY and pass them through to the client', function () {
      var data;
      new PongSocket(socket_io, {id: '123'});
      socket_io.emit('START_GAME');

      expect(jns.getCallsFilteredByFirstArg(socket_io.emit.calls, 'PLAYER_JOINED').length).toBe(0);
      data = {name: 'John', id: '123'};
      game.getEventsEmitter().emit('PLAYER_JOINED', data);
      expect(jns.getCallsFilteredByFirstArg(socket_io.emit.calls, 'PLAYER_JOINED').length).toBe(1);
      expect(jns.getCallsFilteredByFirstArg(socket_io.emit.calls, 'PLAYER_JOINED')[0].args[1]).toEqual(data);

      expect(jns.getCallsFilteredByFirstArg(socket_io.emit.calls, 'PLAYER_SCORE_CHANGED').length).toBe(0);
      data = {id: '123', score: 1};
      game.getEventsEmitter().emit('PLAYER_SCORE_CHANGED', data);
      expect(jns.getCallsFilteredByFirstArg(socket_io.emit.calls, 'PLAYER_SCORE_CHANGED').length).toBe(1);
      expect(jns.getCallsFilteredByFirstArg(socket_io.emit.calls, 'PLAYER_SCORE_CHANGED')[0].args[1]).toEqual(data);

      expect(jns.getCallsFilteredByFirstArg(socket_io.emit.calls, 'PLAYER_QUIT').length).toBe(0);
      data = {id: 'PLAYER_QUIT'};
      game.getEventsEmitter().emit('PLAYER_QUIT', data);
      expect(jns.getCallsFilteredByFirstArg(socket_io.emit.calls, 'PLAYER_QUIT').length).toBe(1);
      expect(jns.getCallsFilteredByFirstArg(socket_io.emit.calls, 'PLAYER_QUIT')[0].args[1]).toEqual(data);

      expect(jns.getCallsFilteredByFirstArg(socket_io.emit.calls, 'PLAYER_READY').length).toBe(0);
      data = {id: 'PLAYER_READY'};
      game.getEventsEmitter().emit('PLAYER_READY', data);
      expect(jns.getCallsFilteredByFirstArg(socket_io.emit.calls, 'PLAYER_READY').length).toBe(1);
      expect(jns.getCallsFilteredByFirstArg(socket_io.emit.calls, 'PLAYER_READY')[0].args[1]).toEqual(data);

    });
    
    describe('MATCH_STARTED', function () {
      
      it('and passes it through to the client', function () {
        new PongSocket(socket_io, {id: '123'});
        socket_io.emit('START_GAME');

        expect(jns.getCallsFilteredByFirstArg(socket_io.emit.calls, 'MATCH_STARTED').length).toBe(0);
        game.getEventsEmitter().emit('MATCH_STARTED');
        expect(jns.getCallsFilteredByFirstArg(socket_io.emit.calls, 'MATCH_STARTED').length).toBe(1);
        expect(jns.getCallsFilteredByFirstArg(socket_io.emit.calls, 'MATCH_STARTED')[0].args[1]).toBeUndefined();
      });
      
      it('and starts periodic client updates with message MATCH_UPDATE', function () {
        var socket = new PongSocket(socket_io, {id: '123'});

        socket_io.emit('START_GAME');

        jasmine.Clock.useMock();
        spyOn(game, 'getBallAndPaddlePositions').andCallThrough();

        expect(jns.getCallsFilteredByFirstArg(socket_io.emit.calls, 'MATCH_UPDATE').length).toEqual(0);
        game.getEventsEmitter().emit('MATCH_STARTED');
        expect(jns.getCallsFilteredByFirstArg(socket_io.emit.calls, 'MATCH_UPDATE').length).toEqual(1);
        jasmine.Clock.tick(socket.MATCH_UPDATE_PERIOD_MILLIS + 10);
        var updates = jns.getCallsFilteredByFirstArg(socket_io.emit.calls, 'MATCH_UPDATE');
        expect(updates.length).toEqual(2);

        expect(_.last(updates).args[1].time).toBeDefined();
        expect(game.getBallAndPaddlePositions).toHaveBeenCalled();
        expect(_.last(updates).args[1].objects).toEqual(game.getBallAndPaddlePositions());

        jasmine.Clock.tick(socket.MATCH_UPDATE_PERIOD_MILLIS * 3);

        expect(jns.getCallsFilteredByFirstArg(socket_io.emit.calls, 'MATCH_UPDATE').length).toEqual(5);
      });
      
    });

    describe('MATCH_STOPPED', function () {
      
      it('and passes it through to the client', function () {
        new PongSocket(socket_io, {id: '123'});
        socket_io.emit('START_GAME');

        expect(jns.getCallsFilteredByFirstArg(socket_io.emit.calls, 'MATCH_STOPPED').length).toBe(0);
        game.getEventsEmitter().emit('MATCH_STOPPED');
        expect(jns.getCallsFilteredByFirstArg(socket_io.emit.calls, 'MATCH_STOPPED').length).toBe(1);
        expect(jns.getCallsFilteredByFirstArg(socket_io.emit.calls, 'MATCH_STOPPED')[0].args[1]).toBeUndefined();
      });
      
      it('stops sending MATCH_UPDATE messages', function () {
        var socket = new PongSocket(socket_io, {id: '123'});

        socket_io.emit('START_GAME');
        game.getEventsEmitter().emit('MATCH_STARTED');

        jasmine.Clock.useMock();
        jasmine.Clock.tick(socket.MATCH_UPDATE_PERIOD_MILLIS * 3);

        expect(jns.getCallsFilteredByFirstArg(socket_io.emit.calls, 'MATCH_UPDATE').length).toEqual(4);

        game.getEventsEmitter().emit('MATCH_STOPPED');

        jasmine.Clock.tick(socket.MATCH_UPDATE_PERIOD_MILLIS * 3);
        expect(jns.getCallsFilteredByFirstArg(socket_io.emit.calls, 'MATCH_UPDATE').length).toEqual(4);

      });
    });

  });

});
