'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _virtualDomH = require('virtual-dom/h');

var _virtualDomH2 = _interopRequireDefault(_virtualDomH);

var _virtualDomDiff = require('virtual-dom/diff');

var _virtualDomDiff2 = _interopRequireDefault(_virtualDomDiff);

var _virtualDomCreateElement = require('virtual-dom/create-element');

var _virtualDomCreateElement2 = _interopRequireDefault(_virtualDomCreateElement);

var _virtualDomPatch = require('virtual-dom/patch');

var _virtualDomPatch2 = _interopRequireDefault(_virtualDomPatch);

var leftNode = (0, _virtualDomH2['default'])('ul', [(0, _virtualDomH2['default'])('li', 'TODO1'), (0, _virtualDomH2['default'])('li', 'TODO2')]);
var rightNode = (0, _virtualDomH2['default'])('ul', [(0, _virtualDomH2['default'])('li', 'TODO1'), (0, _virtualDomH2['default'])('li', 'TODO3')]);

window.onload = function () {
  var rootNode = (0, _virtualDomCreateElement2['default'])(leftNode);
  document.querySelector('.v-dom-root').appendChild(rootNode);

  setTimeout(function () {
    var patches = (0, _virtualDomDiff2['default'])(leftNode, rightNode);
    (0, _virtualDomPatch2['default'])(rootNode, patches);
  }, 3000);
};
