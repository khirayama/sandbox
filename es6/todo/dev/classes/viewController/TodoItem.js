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
  }
}
