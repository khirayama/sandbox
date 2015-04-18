'use strict';
import TodoActions from '../actions/TodoActions';

export default class TodoItem {
  constructor(todo) {
    this.todo = todo;
    this.template = 
      `<li class="${this._cx({
        'completed': todo.complete
      })}">
        <div class="view">
          <div class="toggle"></div>
          <label>${todo.text}</label>
          <div class="destroy"></div>
        </div>
      </li>`;
    this.el = this._createElements(this.template);
    this.events();
  }
  events() {
    this.el.querySelector('.toggle').addEventListener('click', () => {
      TodoActions.toggleComplete(this.todo);
    });
    this.el.querySelector('.destroy').addEventListener('click', () => {
      console.log('destroy');
    });
    this.el.querySelector('label').addEventListener('click', () => {
      console.log('edit');
    });
  }
  _createElements(template) {
    var tmp = document.implementation.createHTMLDocument();
    tmp.body.innerHTML = template;
    return tmp.body.children[0];
  }
  _cx(classNames) {
    let classStr = '';
    for(let className in classNames) {
      if(classNames[className]) {
        classStr += className;
      }
    }
    return classStr;
  }
}
