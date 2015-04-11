'use strict';
import 'babel/polyfill';
import Model from './Model';

class Todo extends Model {
  constructor() {
    let actions = {
      'TODO_CREATE': (action) => {
        let text = action.text.trim();
        if (text !== '') {
          this._create(text);
        }
      },
      'TODO_UNDO_COMPLETE': (action) => {
        this._update(action.id, {complete: false});
      },
      'TODO_COMPLETE': (action) => {
        this._update(action.id, {complete: true});
      },
      'TODO_DESTROY': (action) => {
        this._destroy(action.id);
      }
    };
    super(actions);

    this._todos = {};
  }
  _create(text) {
    let id = (+new Date() + Math.floor(Math.random() * 999999)).toString(36);
    this._todos[id] = {
      id: id,
      complete: false,
      text: text
    };
  }
  _update(id, updates) {
    this._todos[id] = Object.assign({}, this._todos[id], updates);
  }
  _destroy(id) {
    delete this._todos[id];
  }

  getAll() {
    return this._todos;
  }
}
export default new Todo();
