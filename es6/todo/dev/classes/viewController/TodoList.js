'use strict';
import Todo from '../model/Todo';
import TodoItem from './TodoItem';

export default class TodoList {
  constructor(el) {
    this.state = {
      todos: Todo.getAll()
    };
    this.el = el;
    Todo.addChangeListener(() => this._onChange());
  }
  _onChange() {
    this.render();
  }
  render() {
    let todo = {};
    this.el.innerHTML = '';
    for(let key in this.state.todos) {
      todo = this.state.todos[key];
      // TODO: 可能ならまとめてappendしたい
      this.el.appendChild(new TodoItem(todo).el);
    }
   }
}
