'use strict';
import Todo from '../model/Todo';
import TodoItem from './TodoItem';

export default class TodoList {
  constructor(el) {
    this.state = {
      todos: Todo.getAll()
    };
    this.el = el;
    Todo.addChangeListener(this._onChange.bind(this));
  }
  _onChange() {
    this.render();
  }
  render() {
    let todos = [];
    let todo = {};
    for(let key in this.state.todos) {
      todo = this.state.todos[key];
      todos.push(new TodoItem(todo).template);
    }
    console.log(todos);
    this.el.innerHTML = todos.join('');
   }
}
