var Zepto = (function() {
  var undefined, $, classList, emptyArray = [],
    slice = emptyArray.slice,
    filter = emptyArray.filter,
    document = window.document,
    classCache = {},
    fragmentRE = /^\s*<(\w+|!)[^>]*>/,
    tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
    adjacencyOperators = ["after", "prepend", "before", "append"],
    simpleSelectorRE = /^[\w-]*$/,
    class2type = {},
    zepto = {};
  function type(obj) {
    return obj == null ? String(obj) : class2type[toString.call(obj)] || "object"
  }
  function isFunction(value) {
    return type(value) == "function"
  }
  function isDocument(obj) {
    return obj != null && obj.nodeType == obj.DOCUMENT_NODE
  }
  function likeArray(obj) {
    return typeof obj.length == "number"
  }
  function dasherize(str) {
    return str.replace(/::/g, "/").replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2").replace(/([a-z\d])([A-Z])/g, "$1_$2").replace(/_/g, "-").toLowerCase()
  }
  function classRE(name) {
    return name in classCache ? classCache[name] : (classCache[name] = new RegExp("(^|\\s)" + name + "(\\s|$)"))
  }
  function maybeAddPx(name, value) {
    return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value
  }
  zepto.fragment = function(html, name, properties) {
    var dom, nodes, container;
    var containers = {
      "*": document.createElement("div")
    };
    if (!dom) {
      if (html.replace) html = html.replace(tagExpanderRE, "<$1></$2>");
      if (name === undefined) name = fragmentRE.test(html) && RegExp.$1;
      if (!(name in containers)) name = "*";
      container = containers[name];
      container.innerHTML = "" + html;
      dom = $.each(slice.call(container.childNodes), function() {
        container.removeChild(this)
      })
    }
    return dom
  };
  zepto.Z = function(dom, selector) {
    dom = dom || [];
    dom.__proto__ = $.fn;
    dom.selector = selector || "";
    return dom
  };
  zepto.init = function(selector, context) {
    var dom;
    if (typeof selector == "string") {
      selector = selector.trim();
      if (selector[0] == "<" && fragmentRE.test(selector)) {
        dom = zepto.fragment(selector, RegExp.$1, context), selector = null
      } else {
        dom = zepto.qsa(document, selector);
      }
    } else {
      if (Array.isArray(selector)) {
        dom = (function(array) {
          return filter.call(array, function(item) {
            return item != null
          })
        })(selector);
      } else {
        dom = [selector], selector = null
      }
    }
    return zepto.Z(dom, selector)
  };
  $ = function(selector, context) {
    return zepto.init(selector, context)
  };
  zepto.qsa = function(element, selector) {
    var found, maybeID = selector[0] == "#",
      maybeClass = !maybeID && selector[0] == ".",
      nameOnly = maybeID || maybeClass ? selector.slice(1) : selector,
      isSimple = simpleSelectorRE.test(nameOnly);
    return (isDocument(element) && isSimple && maybeID) ? ((found = element.getElementById(nameOnly)) ? [found] : []) : (element.nodeType !== 1 && element.nodeType !== 9) ? [] : slice.call(isSimple && !maybeID ? maybeClass ? element.getElementsByClassName(nameOnly) : element.getElementsByTagName(selector) : element.querySelectorAll(selector))
  };

  function funcArg(context, arg, idx, payload) {
    return isFunction(arg) ? arg.call(context, idx, payload) : arg
  }

  function className(node, value) {
    var klass = node.className,
      svg = klass && klass.baseVal !== undefined;
    if (value === undefined) return svg ? klass.baseVal : klass;
  }

  $.isFunction = isFunction;
  $.isArray = Array.isArray;

  $.map = function(elements, callback) {
    var value, values = [],
      i, key;
    if (likeArray(elements)) {
      for (i = 0; i < elements.length; i++) {
        value = callback(elements[i], i);
        if (value != null) values.push(value);
      }
    }
    return (function(array) {
      return array.length > 0 ? $.fn.concat.apply([], array) : array
    })(values);
  };
  $.each = function(elements, callback) {
    var i, key;
    if (likeArray(elements)) {
      for (i = 0; i < elements.length; i++) {
        if (callback.call(elements[i], i, elements[i]) === false) return elements;
      }
    } else {
      for (key in elements) {
        if (callback.call(elements[key], key, elements[key]) === false) return elements;
      }
    }
    return elements
  };
  $.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
    class2type["[object " + name + "]"] = name.toLowerCase()
  });
  $.fn = {
    concat: emptyArray.concat,
    remove: function() {
      return this.each(function() {
        if (this.parentNode != null) this.parentNode.removeChild(this);
      })
    },
    each: function(callback) {
      emptyArray.every.call(this, function(el, idx) {
        return callback.call(el, idx, el) !== false
      });
      return this
    },
    find: function(selector) {
      var result, $this = this;
      result = $(zepto.qsa(this[0], selector))
      return result
    },
    text: function(text) {
      return 0 in arguments ? this.each(function(idx) {
        var newText = funcArg(this, text, idx, this.textContent);
        this.textContent = newText == null ? "" : "" + newText
      }) : (0 in this ? this[0].textContent : null)
    },
    css: function(property, value) {
      if (arguments.length < 2) var element = this[0],
        computedStyle = getComputedStyle(element, "");
      var css = "";
      if (type(property) == "string") {
        css = dasherize(property) + ":" + maybeAddPx(property, value);
      } else {
        for (key in property) {
          css += dasherize(key) + ":" + maybeAddPx(key, property[key]) + ";"
        }
      }
      return this.each(function() {
        this.style.cssText += ";" + css
      })
    },
    hasClass: function(name) {
      return emptyArray.some.call(this, function(el) {
        return this.test(className(el))
      }, classRE(name))
    },
    addClass: function(name) {
      return this.each(function(idx) {
        classList = [];
        var cls = className(this),
          newName = funcArg(this, name, idx, cls);
        newName.split(/\s+/g).forEach(function(klass) {
          if (!$(this).hasClass(klass)) classList.push(klass);
        }, this);
        classList.length && className(this, cls + (cls ? " " : "") + classList.join(" "))
      })
    },
    removeClass: function(name) {
      return this.each(function(idx) {
        classList = className(this);
        funcArg(this, name, idx, classList).split(/\s+/g).forEach(function(klass) {
          classList = classList.replace(classRE(klass), " ")
        });
        className(this, classList.trim())
      })
    }
  };
  adjacencyOperators.forEach(function(operator, operatorIndex) {
    var inside = operatorIndex % 2;
    $.fn[operator] = function() {
      var argType, nodes = $.map(arguments, function(arg) {
          argType = type(arg);
          return argType == "object" || argType == "array" || arg == null ? arg : zepto.fragment(arg)
        }),
        parent, copyByClone = this.length > 1;
      return this.each(function(_, target) {
        parent = inside ? target : target.parentNode;
        target = operatorIndex == 0 ? target.nextSibling : operatorIndex == 1 ? target.firstChild : operatorIndex == 2 ? target : null;
        var parentInDocument = true;
        nodes.forEach(function(node) {
          parent.insertBefore(node, target);
        })
      })
    };
  });
  return $;
})();

window.Zepto = Zepto;
window.$ === undefined && (window.$ = Zepto);

// OK!
(function($) {
  var _zid = 1;
  var isFunction = $.isFunction;

  $.fn.on = function(event, selector, data, callback) {
    var $this = this;
    if (!(typeof selector == "string") && !isFunction(callback) && callback !== false) callback = data, data = selector, selector = undefined;
    if (isFunction(data) || data === false) callback = data, data = undefined;
    return $this.each(function(_, element) {
      (function(element, events, fn, selector, capture) {
        var id = element._zid || (element._zid = _zid++);
        console.log(id);
        events.split(/\s/).forEach(function(event) {
          var handler = {}, callback = fn;
          handler.proxy = function(event) {
            var result = callback.apply(element, event._args == undefined ? [event] : [event].concat(event._args));
            return result
          };
          if ("addEventListener" in element) element.addEventListener(event, handler.proxy, false);
        })
      })(element, event, callback, selector);
    })
  };
  $.fn.trigger = function(event, args) {
    event = (function(type) {
      var event = document.createEvent("Events");
      event.initEvent(type, true, true);
      return event;
    })(event);
    event._args = args;
    return this.each(function() {
      this.dispatchEvent(event);
    })
  };
})(Zepto);
