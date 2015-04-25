'use strict';
import TodoActions from '../actions/TodoActions';

export default class TodoItem {
  constructor(todo) {
    this.state = {
      isEditing: false
    };
    this.todo = todo;
    this.template = function() {
      return `<li class="${this._cx({
        'completed': this.todo.complete,
        'edit': this.state.isEditing
      })}">
        <div class="view">
          <div class="toggle"></div>
          <label>${this.todo.text}</label>
          <input value="${this.todo.text}"></input>
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
      TodoActions.toggleComplete(this.todo);
    });
    this.on('click', '.destroy', () => {
      TodoActions.destroy(this.todo.id);
    });
    this.on('click', 'label', () => {
      this._onClick();
    });
  }
  on(eventType, selector, callback) {
    if(arguments.length === 2) {
      callback = selector;
      this.el.addEventListener(eventType, callback);
    } else if (arguments.length === 3) {
      this.el.querySelector(selector).addEventListener(eventType, callback);
    }
  }
  _update() {
    let parentNode = this.el.parentNode;
    let tmp = this._createElements(this.template());
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
    this.setState({isEditing: true});
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
