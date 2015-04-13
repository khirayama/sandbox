'use strict';
import AppDispatcher from '../dispatcher/AppDispatcher';

export default class TodoItem {
  constructor(todo) {
    this.template = 
      `<li>
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
      console.log('toggle');
    });
    this.el.querySelector('.destroy').addEventListener('click', () => {
      console.log('destroy');
    });
    this.el.querySelector('label').addEventListener('click', () => {
      console.log('edit');
    });
  }
  _createElements(template) {
    // TODO: DOMparserだとafter要素とか消えた...
    let parser = document.createElement('div');
    parser.innerHTML = template;
    return parser.firstChild;
  }
}
