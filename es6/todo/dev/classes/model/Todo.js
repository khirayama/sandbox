'use strict';
import 'babel/polyfill';
import {EventEmitter} from 'events';
import AppDispatcher from '../dispatcher/AppDispatcher';

var CHANGE_EVENT = 'change';

var _todos = {};

function create(text) {
  var id = (+new Date() + Math.floor(Math.random() * 999999)).toString(36);
  _todos[id] = {
    id: id,
    complete: false,
    text: text
  };
}
function update(id, updates) {
  _todos[id] = Object.assign({}, _todos[id], updates);
}
function destroy(id) {
  delete _todos[id];
}

var Todo = Object.assign({}, EventEmitter.prototype, {
  getAll: function() {
    return _todos;
  },
  emitChange: function() {
    this.emit(CHANGE_EVENT);
  },
  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback);
  },
  removeChangeListener: function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  }
});

AppDispatcher.register(function(action) {
  var text;
  switch(action.actionType) {
    case 'TODO_CREATE':
      text = action.text.trim();
      if (text !== '') {
        create(text);
        Todo.emitChange();
      }
      break;
    case 'TODO_UNDO_COMPLETE':
      update(action.id, {complete: false});
      Todo.emitChange();
      break;
    case 'TODO_COMPLETE':
      update(action.id, {complete: true});
      Todo.emitChange();
      break;
    case 'TODO_DESTROY':
      destroy(action.id);
      Todo.emitChange();
      break;
    default:
  }
});

export default Todo;
