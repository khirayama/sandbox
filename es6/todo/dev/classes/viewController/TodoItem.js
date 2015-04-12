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
    this.events();
  }
  events() {
    let parser = new DOMParser();
    let dom = parser.parseFromString(this.template, 'text/xml');
    this.template = dom.firstChild;
    console.log(this.template);
    this.template.addEventListener('click', (event) => {
      console.log(event);
    });
  }
}
