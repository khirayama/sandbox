'use strict';
var _lastID = 1;
var _prefix = 'ID_';

function Dispatcher() {
  this.$Dispatcher_callbacks = {};
  this.$Dispatcher_isPending = {};
  this.$Dispatcher_isHandled = {};
  this.$Dispatcher_isDispatching = false;
  this.$Dispatcher_pendingPayload = null;
}
Dispatcher.prototype.register=function(callback) {
  var id = _prefix + _lastID++;
  this.$Dispatcher_callbacks[id] = callback;
  return id;
};
Dispatcher.prototype.unregister=function(id) {
  delete this.$Dispatcher_callbacks[id];
};
Dispatcher.prototype.waitFor=function(ids) {
  for (var ii = 0; ii < ids.length; ii++) {
    var id = ids[ii];
    if (this.$Dispatcher_isPending[id]) {
      continue;
    }
    this.$Dispatcher_invokeCallback(id);
  }
};
Dispatcher.prototype.dispatch=function(payload) {
  this.$Dispatcher_startDispatching(payload);
  try {
    for (var id in this.$Dispatcher_callbacks) {
      if (this.$Dispatcher_isPending[id]) {
        continue;
      }
      this.$Dispatcher_invokeCallback(id);
    }
  } finally {
    this.$Dispatcher_stopDispatching();
  }
};
Dispatcher.prototype.isDispatching=function() {
  return this.$Dispatcher_isDispatching;
};
Dispatcher.prototype.$Dispatcher_invokeCallback=function(id) {
  this.$Dispatcher_isPending[id] = true;
  this.$Dispatcher_callbacks[id](this.$Dispatcher_pendingPayload);
  this.$Dispatcher_isHandled[id] = true;
};
Dispatcher.prototype.$Dispatcher_startDispatching=function(payload) {
  for (var id in this.$Dispatcher_callbacks) {
    this.$Dispatcher_isPending[id] = false;
    this.$Dispatcher_isHandled[id] = false;
  }
  this.$Dispatcher_pendingPayload = payload;
  this.$Dispatcher_isDispatching = true;
};
Dispatcher.prototype.$Dispatcher_stopDispatching=function() {
  this.$Dispatcher_pendingPayload = null;
  this.$Dispatcher_isDispatching = false;
};

export default Dispatcher;
