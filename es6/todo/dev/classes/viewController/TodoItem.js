'use strict';

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
    var tmp = document.implementation.createHTMLDocument();
    tmp.body.innerHTML = template;
    return tmp.body.children[0];
  }
}
