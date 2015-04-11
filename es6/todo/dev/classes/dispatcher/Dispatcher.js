'use strict';

function Dispatcher() {
  this._lastID = 1;
  this.callbacks = {};
  this.isPending = {};
  this.pendingPayload = null;
}
Dispatcher.prototype.register=function(callback) {
  var id = 'ID_' + this._lastID++;
  this.callbacks[id] = callback;
  return id;
};
Dispatcher.prototype.unregister=function(id) {
  delete this.callbacks[id];
};
Dispatcher.prototype.dispatch=function(payload) {
  this.startDispatching(payload);
  try {
    for (var id in this.callbacks) {
      if (this.isPending[id]) {
        continue;
      }
      this.invokeCallback(id);
    }
  } finally {
    this.stopDispatching();
  }
};
Dispatcher.prototype.invokeCallback=function(id) {
  this.isPending[id] = true;
  this.callbacks[id](this.pendingPayload);
};
Dispatcher.prototype.startDispatching=function(payload) {
  for (var id in this.callbacks) {
    this.isPending[id] = false;
  }
  this.pendingPayload = payload;
};
Dispatcher.prototype.stopDispatching=function() {
  this.pendingPayload = null;
};
export default Dispatcher;
