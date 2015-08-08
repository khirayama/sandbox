import h from 'virtual-dom/h';
import diff from 'virtual-dom/diff';

import createElement from 'virtual-dom/create-element';
import patch from 'virtual-dom/patch';

let leftNode = h('ul', [
  h('li', 'TODO1'),
  h('li', 'TODO2')
]);
let rightNode = h('ul', [
  h('li', 'TODO1'),
  h('li', 'TODO3')
]);

window.onload = () => {
  let rootNode = createElement(leftNode);
  document.querySelector('.v-dom-root').appendChild(rootNode);

  setTimeout(() => {
    let patches = diff(leftNode, rightNode);
    patch(rootNode, patches);
  }, 3000);
};
