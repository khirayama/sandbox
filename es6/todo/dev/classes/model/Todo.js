'use strict';
import 'babel/polyfill';
import {EventEmitter} from 'events';
import AppDispatcher from '../dispatcher/AppDispatcher';

const CHANGE_EVENT = 'CHANGE';

class Todo extends EventEmitter {
  constructor() {
    super();
    this._todos = {};

    AppDispatcher.register((action) => {
      this._onAction(action);
    });
  }
  _onAction(action) {
    switch(action.actionType) {
      case 'TODO_CREATE':
        let text = action.text.trim();
        if (text !== '') {
          this._create(text);
          this.emitChange();
        }
        break;
      case 'TODO_UNDO_COMPLETE':
        this._update(action.id, {complete: false});
        this.emitChange();
        break;
      case 'TODO_COMPLETE':
        this._update(action.id, {complete: true});
        this.emitChange();
        break;
      case 'TODO_DESTROY':
        this._destroy(action.id);
        this.emitChange();
        break;
      default:
    }
  }
  _create(text) {
    let id = (+new Date() + Math.floor(Math.random() * 999999)).toString(36);
    this._todos[id] = {
      id: id,
      complete: false,
      text: text
    };
  }
  _update(id, updates) {
    this._todos[id] = Object.assign({}, this._todos[id], updates);
  }
  _destroy(id) {
    delete this._todos[id];
  }

  getAll() {
    return this._todos;
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
export default new Todo();
