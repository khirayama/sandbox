'use strict';
import AppDispatcher from '../dispatcher/AppDispatcher';

var TodoActions = {
  create: function(text) {
    AppDispatcher.dispatch({
      actionType: 'TODO_CREATE',
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
  }
};
export default TodoActions;
