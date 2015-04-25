'use strict';
import TodoStore from '../stores/TodoStore';
import TodoItem from './TodoItem';
import Component from '../framework/Component';

export default class TodoList extends Component {
  constructor(el) {
    super(el, {
      todos: TodoStore.getAll()
    });
    TodoStore.addChangeListener(() => this._onChange());
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
