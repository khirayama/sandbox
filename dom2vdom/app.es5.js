'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _virtualDomVnodeVnode = require('virtual-dom/vnode/vnode');

var _virtualDomVnodeVnode2 = _interopRequireDefault(_virtualDomVnodeVnode);

var _virtualDomVnodeVtext = require('virtual-dom/vnode/vtext');

var _virtualDomVnodeVtext2 = _interopRequireDefault(_virtualDomVnodeVtext);

var _dom2vdom = require('./dom2vdom');

var _dom2vdom2 = _interopRequireDefault(_dom2vdom);

var convertHTML = (0, _dom2vdom2['default'])({
  VNode: _virtualDomVnodeVnode2['default'],
  VText: _virtualDomVnodeVtext2['default']
});

var html = '<div>Foobar</div>';

var vTree = convertHTML(html);
var createElement = require('virtual-dom/create-element');
var el = createElement(vTree);

document.body.appendChild(el);
