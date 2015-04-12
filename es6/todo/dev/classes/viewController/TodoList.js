'use strict';
import Todo from '../model/Todo';

export default class TodoList {
  constructor(el) {
    this.el = el;

    Todo.addChangeListener(this._onChange.bind(this));
  }
  _onChange() {
    this.render();
  }
  render() {
    // TODO: TodoItemをnewして書き出す
    console.log('create TodoItems');
  }
}
