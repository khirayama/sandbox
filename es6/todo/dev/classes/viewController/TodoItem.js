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
    this.events();
  }
  setState(state) {
    this.state = Object.assign({}, this.state, state);
    this._update();
  }
  events() {
    this.el.querySelector('.toggle').addEventListener('click', () => {
      TodoActions.toggleComplete(this.todo);
    });
    this.el.querySelector('.destroy').addEventListener('click', () => {
      TodoActions.destroy(this.todo.id);
    });
    this.el.querySelector('label').addEventListener('click', () => {
      this._onClick();
    });
  }
  _update() {
    let parentNode = this.el.parentNode;
    let tmp = this._createElements(this.template());
    parentNode.replaceChild(tmp, this.el);
    this.el = tmp;
    this.events();
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
