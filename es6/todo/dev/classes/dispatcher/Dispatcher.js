'use strict';
export default class Dispatcher {
  constructor() {
    this._lastID = 1;
    this._callbacks = {};
    this._isPending = {};
    this._pendingPayload = null;
  }
  register(callback) {
    let id = 'ID_' + this._lastID++;
    this._callbacks[id] = callback;
    return id;  
  }
  unregister(id) {
    delete this._callbacks[id];
  }
  dispatch(payload) {
    this._startDispatching(payload);
    try {
      for (var id in this._callbacks) {
        if (this._isPending[id]) {
          continue;
        }
        this._invokeCallback(id);
      }
    } finally {
      this._stopDispatching();
    }
  }
  _invokeCallback(id) {
    this._isPending[id] = true;
    this._callbacks[id](this._pendingPayload);
  }
  _startDispatching(payload) {
    for (var id in this._callbacks) {
      this._isPending[id] = false;
    }
    this._pendingPayload = payload;
  }
  _stopDispatching() {
    this._pendingPayload = null;
  }
}
