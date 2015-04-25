'use strict';
import Todo from '../model/Todo';
import TodoItem from './TodoItem';
import View from './View';

export default class TodoList extends View {
  constructor(el) {
    super();
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
      this.el.appendChild(new TodoItem(todo).el);
    }
  }
}
