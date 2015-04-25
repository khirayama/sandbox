'use strict';
import TodoActions from '../actions/TodoActions';
import View from './View';

export default class TodoItem extends View {
  constructor(todo) {
    super();
    this.state = {
      isEditing: false
    };
    this.props = {
      todo: todo
    };
    this.input = function() {
      if(this.state.isEditing) {
        return `<input
                  class="edit"
                  type="text"
                  value="${this.props.todo.text}">
                </input>`;
      } else {
        return `<label>${this.props.todo.text}</label>`;
      }
    };
    this.template = function() {
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
    };
    this.el = this._createElements(this.template());
    this.handleEvents();
  }
  setState(state) {
    this.state = Object.assign({}, this.state, state);
    this._update();
  }
  handleEvents() {
    this.on('click', '.toggle', () => {
      TodoActions.toggleComplete(this.props.todo);
    });
    this.on('click', '.destroy', () => {
      TodoActions.destroy(this.props.todo.id);
    });
    this.on('click', 'label', () => {
      this._onClick();
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
  on(eventType, selector, callback) {
    if(arguments.length === 2) {
      callback = selector;
      this.el.addEventListener(eventType, callback);
    } else if (arguments.length === 3) {
      let target = this.el.querySelector(selector);
      if(target) target.addEventListener(eventType, callback);
    }
  }
  _update() {
    let parentNode = this.el.parentNode;
    let tmp = this._createElements(this.template());
    console.log(parentNode);
    parentNode.replaceChild(tmp, this.el);
    this.el = tmp;
    this.handleEvents();
  }
  _createElements(template) {
    var tmp = document.implementation.createHTMLDocument();
    tmp.body.innerHTML = template;
    return tmp.body.children[0];
  }
  _onClick() {
    this.setState({ isEditing: true });
    this.el.querySelector('.edit').focus();
  }
  _cx(classNames) {
    let classStr = [];
    for(let className in classNames) {
      if(classNames[className]) {
        classStr.push(className);
      }
    }
    return classStr.join(' ');
  }
}
