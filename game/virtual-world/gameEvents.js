"use strict";

// basic imports
var events = require('events');

// for us to do a require later
module.exports = GameEventsEmitter;

function GameEventsEmitter() {
  events.EventEmitter.call(this);
}

// inherit events.EventEmitter
GameEventsEmitter.super_ = events.EventEmitter;
GameEventsEmitter.prototype = Object.create(events.EventEmitter.prototype, {
  constructor: {
    value: GameEventsEmitter,
    enumerable: false
  }
});

GameEventsEmitter.prototype.events = {
  BALL_MOVED: "BALL_MOVED"
};

GameEventsEmitter.prototype.ballMoved = function (position) {
  this.emit(this.events.BALL_MOVED, position);
};


