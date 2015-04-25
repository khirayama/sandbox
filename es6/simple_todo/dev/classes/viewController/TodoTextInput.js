'use strict';
import Todo from '../model/Todo';
import TodoActions from '../actions/TodoActions';
import View from './View';

export default class TodoTextInput extends View {
  constructor(el) {
    super(el);
    Todo.addChangeListener(() => this._onChange());
  }
  handleEvents() {
    this.on('keydown', (event) => {
      if(event.keyCode !== 13) return;
      let text = this.el.value;
      if(!text) return;
      TodoActions.create(text);
    });
  }
  _onChange() {
    this.el.value = '';
  }
}

