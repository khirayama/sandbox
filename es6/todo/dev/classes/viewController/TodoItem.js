'use strict';
import TodoActions from '../actions/TodoActions';
import View from './View';

export default class TodoItem extends View {
  constructor(todo) {
    super('template', {
      isEditing: false
    }, {
      todo: todo
    });
  }
  handleEvents() {
    this.on('click', '.toggle', () => {
      TodoActions.toggleComplete(this.props.todo);
    });
    this.on('click', '.destroy', () => {
      TodoActions.destroy(this.props.todo.id);
    });
    this.on('click', 'label', () => {
      this.setState({ isEditing: true });
      this.el.querySelector('.edit').focus();
    });
    this.on('blur', '.edit', (event) => {
      let text = event.target.value;
      this.setState({isEditing: false});
      TodoActions.updateText(this.props.todo.id, text);
    });
    this.on('keyup', '.edit', (event) => {
      if(event.keyCode !== 13) return;
      this.el.querySelector('.edit').blur();
    });
  }
  template() {
    return `<li class="${this._cx({
      'completed': this.props.todo.complete,
      'editing': this.state.isEditing
    })}">
      <div class="view">
        <div class="toggle"></div>
        ${this.input()}
        <div class="destroy"></div>
      </div>
    </li>`;
  }
  input() {
    if(this.state.isEditing) {
      return `<input class="edit" type="text" value="${this.props.todo.text}"></input>`;
    } else {
      return `<label>${this.props.todo.text}</label>`;
    }
  }
}
