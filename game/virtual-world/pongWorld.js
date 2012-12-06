"use strict";


var log = require("log4js").getLogger("game");
var b2d = require("box2d");

var PongWorld = function (){
  var worldAABB = new b2d.b2AABB();
  worldAABB.lowerBound.Set(-100.0, -100.0);
  worldAABB.upperBound.Set(100.0, 100.0);

  var gravity = new b2d.b2Vec2(0.0, -10.0);
  var doSleep = true;

  this.world = new b2d.b2World(worldAABB, gravity, doSleep);

  // Ground Box
  var groundBodyDef = new b2d.b2BodyDef();
  groundBodyDef.position.Set(0.0, -10.0);

  var groundBody = this.world.CreateBody(groundBodyDef);

  var groundShapeDef = new b2d.b2PolygonDef();
  groundShapeDef.SetAsBox(50.0, 10.0);

  groundBody.CreateShape(groundShapeDef);

  // Dynamic Body
  var bodyDef = new b2d.b2BodyDef();
  bodyDef.position.Set(0.0, 4.0);

  this.body = this.world.CreateBody(bodyDef);

  var shapeDef = new b2d.b2PolygonDef();
  shapeDef.SetAsBox(1.0, 1.0);
  shapeDef.density = 1.0;
  shapeDef.friction = 0.3;
  this.body.CreateShape(shapeDef);
  this.body.SetMassFromShapes();

  // Run Simulation!
  this.b2dStep = 1.0 / 60.0;
  this.gameStep = 1000 / 60;
  this.iterations = 10;
};

module.exports = PongWorld;

PongWorld.prototype.startLoop = function () {
  var that = this;
  var step = function (){
    that.world.Step(that.b2dStep, that.iterations);
    var position = that.body.GetPosition();
    var angle = that.body.GetAngle();
    setTimeout(step, gameStep);
  };
  setTimeout(step, gameStep);
};

PongWorld.prototype.getBodyPositions = function () {
  // TODO return all bodies positions
};

