'use strict';
import AppDispatcher from '../framework/AppDispatcher';

var TodoActions = {
  create: function(text) {
    AppDispatcher.dispatch('TODO_CREATE', {
      text: text
    });
  },
  updateText: function(id, text) {
    AppDispatcher.dispatch('TODO_UPDATE_TEXT', {
      id: id,
      text: text
    });
  },
  toggleComplete: function(todo) {
    let id = todo.id;
    if (todo.complete) {
      AppDispatcher.dispatch('TODO_UNDO_COMPLETE', {
        id: id
      });
    } else {
      AppDispatcher.dispatch('TODO_COMPLETE', {
        id: id
      });
    }
  },
  destroy: function(id) {
    AppDispatcher.dispatch('TODO_DESTROY', {
      id: id
    });
  }
};
export default TodoActions;
