'use strict';

export default class View {
  // TODO: componentsの破棄（イベント消したり）
  // TODO: animationを考慮したAPIの追加（animationってなんかダサいからUIとかにしよう）
  // TODO: renderメソッドとtemplateメソッドをうまく抽象化して吸収したほうがいい
  // TODO: html escape
  constructor(el, state = {}, props = {}) {
    this.state = state;
    this.props = props;
    if(typeof el === 'object') {
      this.el = el;
    } else if(typeof el === 'string') {
      this.el = this._createElements(this.template());
    }
    this.handleEvents();
  }
  handleEvents() {
  }
  setState(state) {
    this.state = Object.assign({}, this.state, state);
    this._update();
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
    parentNode.replaceChild(tmp, this.el);
    this.el = tmp;
    this.handleEvents();
  }
  _createElements(template) {
    var tmp = document.implementation.createHTMLDocument();
    tmp.body.innerHTML = template;
    return tmp.body.children[0];
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
