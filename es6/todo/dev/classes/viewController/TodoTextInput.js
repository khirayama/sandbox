'use strict';
import Todo from '../model/Todo';
import TodoActions from '../actions/TodoActions';

export default class TodoTextInput {
  constructor(el) {
    this.el = el;
    this.events();
    Todo.addChangeListener(() => this._onChange());
  }
  events() {
    this.el.addEventListener('keydown', (event) =>  {
      if(event.keyCode !== 13) return;
      let text = this.el.value;
      if(!text) return;
      TodoActions.create(text);
    });
  }
  _onChange() {
    this.el.value = '';
  }
}

