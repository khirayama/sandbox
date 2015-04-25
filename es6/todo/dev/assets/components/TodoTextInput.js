'use strict';
import TodoStore from '../stores/TodoStore';
import TodoActions from '../actions/TodoActions';
import Component from '../framework/Component';

export default class TodoTextInput extends Component {
  constructor(el) {
    super(el);
    TodoStore.addChangeListener(() => this._onChange());
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

