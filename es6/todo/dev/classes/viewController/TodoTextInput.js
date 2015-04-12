'use strict';
import Todo from '../model/Todo';
import AppDispatcher from '../dispatcher/AppDispatcher';

export default class TodoTextInput {
  constructor(el) {
    this.el = el;
    this.events();

    Todo.addChangeListener(this._onChange.bind(this));
  }
  events() {
    this.el.addEventListener('keydown', (event) =>  {
      if(event.keyCode !== 13) return;
      let text = this.el.value || 'inputからだよ';
      AppDispatcher.dispatch({
        actionType: 'TODO_CREATE',
        text: text
      });
    });
  }
  _onChange() {
    this.el.value = '';
  }
}

