'use strict';
import AppDispatcher from '../dispatcher/AppDispatcher';

var TodoActions = {
  create: function(text) {
    AppDispatcher.dispatch({
      actionType: 'TODO_CREATE',
      text: text
    });
  }
};
export default TodoActions;
