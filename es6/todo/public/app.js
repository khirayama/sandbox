(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, '__esModule', {
  value: true
});
'use strict';

var User = (function () {
  function User(name) {
    _classCallCheck(this, User);

    this._name = name;
  }

  _createClass(User, [{
    key: 'say',
    value: function say() {
      return 'My name is ' + this._name;
    }
  }]);

  return User;
})();

exports['default'] = User;
module.exports = exports['default'];

},{}],2:[function(require,module,exports){
'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, '__esModule', {
  value: true
});
'use strict';

var User = (function () {
  function User(name) {
    _classCallCheck(this, User);

    this._name = name;
  }

  _createClass(User, [{
    key: 'say',
    value: function say() {
      return 'My name is ' + this._name;
    }
  }]);

  return User;
})();

exports['default'] = User;
module.exports = exports['default'];

},{}],3:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _User = require('./classes/user.js');

var _User2 = _interopRequireWildcard(_User);

var _Animal = require('./classes/animal.js');

var _Animal2 = _interopRequireWildcard(_Animal);

var user = new _User2['default']('Kotaro');
var animal = new _Animal2['default']('Lion');
console.log('app ok ' + user.say() + ' and ' + animal.say());

},{"./classes/animal.js":1,"./classes/user.js":2}]},{},[3])