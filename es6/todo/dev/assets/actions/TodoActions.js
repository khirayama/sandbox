'use strict';
import AppDispatcher from '../framework/AppDispatcher';

var TodoActions = {
  create: function(text) {
    AppDispatcher.dispatch({
      actionType: 'TODO_CREATE',
      text: text
    });
  },
  updateText: function(id, text) {
    AppDispatcher.dispatch({
      actionType: 'TODO_UPDATE_TEXT',
      id: id,
      text: text
    });
  },
  toggleComplete: function(todo) {
    let id = todo.id;
    if (todo.complete) {
      AppDispatcher.dispatch({
        actionType: 'TODO_UNDO_COMPLETE',
        id: id
      });
    } else {
      AppDispatcher.dispatch({
        actionType: 'TODO_COMPLETE',
        id: id
      });
    }
  },
  destroy: function(id) {
    AppDispatcher.dispatch({
      actionType: 'TODO_DESTROY',
      id: id
    });
  }
};
export default TodoActions;
