'use strict';
import 'babel/polyfill';
import Observer from './Observer';
import AppDispatcher from './AppDispatcher';

const CHANGE_EVENT = 'CHANGE';

export default class Store extends Observer {
  constructor(actions) {
    super();
    this.actions = actions;
    for(let key in this.actions) {
      let action = actions[key];
      AppDispatcher.on(key, (data) => {
        action(data);
        this.dispatchChange();
      });
    }
  }
  dispatchChange() {
    this.dispatch(CHANGE_EVENT);
  }
  addChangeListener(callback) {
    this.on(CHANGE_EVENT, callback);
  }
  removeChangeListener(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  }
}

