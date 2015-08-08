'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _htmlparser2 = require('htmlparser2');

var _htmlparser22 = _interopRequireDefault(_htmlparser2);

window.onload = function () {
  var htmlObj = undefined;
  var rawHtml = '<ul><li><a href="#"></a></li><li><input type="text"/><label>aaa</label></li></ul>';
  var handler = new _htmlparser22['default'].DomHandler(function (error, dom) {
    if (!error) htmlObj = dom;
  });
  var parser = new _htmlparser22['default'].Parser(handler);

  parser.write(rawHtml);
  parser.done();
  console.log(htmlObj);

  if (htmlObj.length) {
    for (var _i = 0; _i < htmlObj.length; _i++) {
      console.log(htmlObj[_i].name);
      if (htmlObj[_i].children.length) {
        for (var i = 0; i < htmlObj[_i].children.length; i++) {
          console.log('  ' + htmlObj[_i].children[i].name);
          if (htmlObj[_i].children[i].children.length) {
            for (var j = 0; j < htmlObj[_i].children[i].children.length; j++) {
              console.log('    ' + htmlObj[_i].children[i].children[j].name);
            }
          }
        }
      }
    }
  }
};
