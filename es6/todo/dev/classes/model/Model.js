'use strict';
import 'babel/polyfill';
import {EventEmitter} from 'events';
import AppDispatcher from '../dispatcher/AppDispatcher';

const CHANGE_EVENT = 'CHANGE';

export default class Model extends EventEmitter {
  constructor(actions) {
    super();
    this.actions = actions;
    AppDispatcher.register((action) => {
      this._actions(action);
    });
  }
  _actions(action) {
    (this.actions[action.actionType])(action);
    this.emitChange();
  }
  emitChange() {
    this.emit(CHANGE_EVENT);
  }
  addChangeListener(callback) {
    this.on(CHANGE_EVENT, callback);
  }
  removeChangeListener(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  }
}
