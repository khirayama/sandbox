var app = app || {};
app.Dispatcher = app.Dispatcher || {};
app.Stores = app.Stores || {};
app.Actions = app.Actions || {};
app.Components = app.Components || {};
var ENTER_KEY = 13;
var ESC_KEY = 27;

(function() {
  'use strict';
  // Dispacher
  app.Dispatcher = function() {
  };

  // Stores
  var _todos = {};
  app.Stores.Todo = {
    create: function(text) {
      var id = (+new Date() + Math.floor(Math.random() * 999999)).toString(36);
      _todos[id] = {
        id: id,
        complete: false,
        text: text
      };
    },
    update: function(id, updates) {
      _todos[id] = assign({}, _todos[id], updates);
    },
    destroy: function(id) {
      delete _todos[id];
    },
    storage: function() {
      if (!_todos) {
        return JSON.parse(localStorage.getItem('todos')) || {};
      } else {
        localStorage.setItem('todos', JSON.stringify(_todos));
      }
    },

    getAll: function() {
      return _todos;
    },
    emitChange: function() {
      // this.emit(CHANGE_EVENT);
    },
    addChangeListener: function(callback) {
      // this.on(CHANGE_EVENT, callback);
    },
    removeChangeListener: function(callback) {
      // this.removeListener(CHANGE_EVENT, callback);
    },

    register: function() {
      var text;
      switch (actionType) {
        case 'TODO_CREATE':
          text = action.text.trim();
          if (text !== '') create(text);
          break;
        case 'TODO_UNDO_COMPLETE':
          update(action.id, {
            complete: false
          });
          break;
        case 'TODO_COMPLETE':
          update(action.id, {
            complete: true
          });
          break;
        case 'TODO_UPDATE_TEXT':
          text = action.text.trim();
          if (text !== '') update(action.id, {
            text: text
          });
          break;
        case 'TODO_DESTROY':
          destroy(action.id);
          break;
        default:
          return true;
      }
      this.storage();
      this.emitChange();
      return true;
    }
  };
  _todos = app.Stores.Todo.storage();

  // Actions
  app.Actions = {
    create: function(text) {
      // AppDispatcher.handleViewAction({
      //   actionType: TodoConstants.TODO_CREATE,
      //   text: text
      // });
    },
    updateText: function(id, text) {
      // AppDispatcher.handleViewAction({
      //   actionType: TodoConstants.TODO_UPDATE_TEXT,
      //   id: id,
      //   text: text
      // });
    },
    toggleComplete: function(todo) {
      var id = todo.id;
      if (todo.complete) {
        // AppDispatcher.handleViewAction({
        //   actionType: TodoConstants.TODO_UNDO_COMPLETE,
        //   id: id
        // });
      } else {
        // AppDispatcher.handleViewAction({
        //   actionType: TodoConstants.TODO_COMPLETE,
        //   id: id
        // });
      }
    },
    destroy: function(id) {
      // AppDispatcher.handleViewAction({
      //   actionType: TodoConstants.TODO_DESTROY,
      //   id: id
      // });
    }
  };

  // Components
  // app.View.TodoItemTemplate =
  //   '<li class="todo-item">'
  //   + '<input class="toggle" type="checkbox" checked="{completed}">'
  //   + '<input class="edit" type="text" value="{content}">'
  //   + '<label class="todo">{content}</label>'
  //   + '<button class="destroy">[delete]</button>'
  //   + '</li>';

  app.Components.TodoItem = function() {};
  app.Components.TodoItem.prototype = {};

  app.Components.TodoTextInput = function() {};
  app.Components.TodoTextInput.prototype = {};

  app.Components.MainSection = function() {};
  app.Components.MainSection.prototype = {};

  app.Components.Header = function() {};
  app.Components.Header.prototype = {};

  app.Components.TodoApp = function() {};
  app.Components.TodoApp.prototype = {};
})();


var assign = function(arg) {
  console.log(arguments);
  if (!obj1) obj1 = {};
  if (!obj2) obj2 = {};
  for (var i = 1; i < arguments.length; i++) {
    for (var attrname in arguments[i]) {
      if (arguments[i].hasOwnProperty(attrname)) {
        arguments[0][attrname] = arguments[i][attrname];
      }
    }
  }
  return arguments[0];
};
