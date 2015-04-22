'use strict';
import TodoActions from '../actions/TodoActions';

export default class TodoItem {
  constructor(todo) {
    this.state = {
      isEditing: false
    };
    this.todo = todo;
    this.template = this._template
      `<li class="${this._cx({
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
    console.log(this.template, this._cx({ edit: this.state.isEditing  }));
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
  _template() {
    let args = arguments;
    let args2 = Array.from(arguments).slice(1);
    console.log(args, args2);
    return function() {
      console.log(args, this, String.raw.apply(null, args));
      let i, _template = '';
      for(i = 1; i < args.length; i++) {
        _template += args[0][i - 1] + args[i];
      }
      _template += args[0][i - 1];
      return _template;
    };
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

// ちょっと試してる
function _template() {
  let template = '';
  let i;
  for(i = 1; i < arguments.length; i++) {
    template += arguments[0][i - 1] + arguments[i];
  }
  template += arguments[0][i - 1];
  return template;
}
var todo = {
  text: 'todo text',
  complete: false
};
let template = _template`text: ${todo.text} / complete: ${todo.complete} / ok`;
console.log(template);

