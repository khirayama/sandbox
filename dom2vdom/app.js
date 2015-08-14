import VNode from 'virtual-dom/vnode/vnode';
import VText from 'virtual-dom/vnode/vtext';
import dom2vdom from './dom2vdom';

let convertHTML = dom2vdom({
  VNode: VNode,
  VText: VText
});

let html = '<div>Foobar</div>';

let vTree = convertHTML(html);
let createElement = require('virtual-dom/create-element');
let el = createElement(vTree);

document.body.appendChild(el);
