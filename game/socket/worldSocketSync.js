/**
 * Socket sync class that keeps all connected clients in sync with the current world
 */

var WorldSocketSync = function (world){
  this._world = world;
  this._sockets = [];
};

WorldSocketSync.prototype.addSocket = function (socket) {
  this._defineCommandsHandler(socket);
  this._sockets.push(socket);
};


WorldSocketSync.prototype.startClientNotificationLoop = function () {
  // TODO every X seconds for all this._sockets send current world state
  // this._world.getBodyPositions();
};

WorldSocketSync.prototype._defineCommandsHandler = function (socket) {
  var that = this;
  socket.on("PLAYER_COMMAND", function (data) {
    console.log("Player sent command %s", data)
    // TODO that._world.movePaddle(...)
  });
  socket.on("LAG_CHECK", function (data) {
    // TODO send current time
    socket.emit({serverTime: new Date().getTime(), id: data.id});
  });
  socket.on('disconnect', function () {
    // TODO remove socket from the list
  });
};

module.exports = WorldSocketSync;