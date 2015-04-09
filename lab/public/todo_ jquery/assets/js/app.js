var app = app || {};

(function(exports) {
  'use strict';
  // Collection /////////////////////////////////////////////////////////////////////////////////////////
  var Collection = function() {
    this.init();
  };
  Collection.prototype = {
    items: {},
    init: function() {
      var _this = this;
      $(window).on('CLICK_DESTROY', function(evt, url) {
        _this.remove(url);
      });
      $(window).on('MODEL_CREATE MODEL_UPDATE MODEL_DELETE', function() {
        _this.save('todoItems');
      });
    },
    remove: function(id) {
      delete this.items[id];
      $(window).trigger('MODEL_DELETE');
    },
    get: function(id) {
      return this.items[id] || this.items;
    },
    save: function(key) {
      localStorage.setItem(key, JSON.stringify(this.items));
    },
    load: function(key) {
      this.items = JSON.parse(localStorage.getItem(key)) || {};
    }
  };

  // Model /////////////////////////////////////////////////////////////////////////////////////////
  var Model = function(collection) {
    this.collection = collection;
    this.init();
  };
  Model.prototype = {
    create: function(id, text) {
      var model = {
        id: id,
        text: text,
        completed: false
      };
      this.collection.items[id] = model;
      $(window).trigger('MODEL_CREATE');
    },
    update: function(id, key, value) {
      this.collection.items[id][key] = value;
      $(window).trigger('MODEL_UPDATE');
    },
    init: function() {
      var _this = this;
      $(window).on('ENTER_INPUT', function(evt, id, text) {
        _this.create(id, text);
      });
      $(window).on('ENTER_ITEM', function(evt, id, text) {
        _this.update(id, 'text', text);
      });
      $(window).on('CLICK_COMPLETE', function(evt, id) {
        _this.update(id, 'completed', true);
      });
      $(window).on('CLICK_UNDO_COMPLETE', function(evt, id) {
        _this.update(id, 'completed', false);
      });
    }
  };

  // View /////////////////////////////////////////////////////////////////////////////////////////
  var TextInput = function($dom) {
    this.$dom = $dom;
    this.init();
  };
  TextInput.prototype = {
    constructor: 'TextInput',
    $dom: null,
    keydownTextInput: function(evt) {
      if(evt.keyCode != 13) return;
      var text = this.$dom.val();
      var id = Math.round(Math.random() * 1000);
      this.$dom.val('');
      $(window).trigger('ENTER_INPUT', [id, text]);
    },
    events: function() {
      this.$dom.on('keydown', this.keydownTextInput.bind(this)); 
    },
    init: function() {
      var _this = this;
      this.events();
    }
  };

  var List = function($dom, items) {
    this.$dom = $dom;
    this.items = items;
    this.init();
  };
  List.prototype = {
    constructor: 'List',
    $dom: null,
    items: {},
    render: function(items) {
      this.$dom.html('');
      for(var key in items) {
        this.$dom.append(new ListItem(items[key].id, items[key].text, items[key].completed));
      }
    },
    events: function() {
      $(window).on('MODEL_CREATE MODEL_UPDATE MODEL_DELETE', this.render.bind(this, this.items));
    },
    init: function() {
      var _this = this;
      this.events();
      this.render(this.items);
    }
  };

  var ListItem = function(id, text, completed) {
    this.id = id;
    this.text = text;
    this.completed = completed;
    this.$template = $('<li><div class="view"><div class="toggle"></div><label>' + this.text + '</label><div class="destroy"></div></div><input class="edit" value="' + this.text + '"></li>');
    return this.init();
  };
  ListItem.prototype = {
    constructor: 'ListItem',
    id: 0,
    text: '',
    completed: false,
    isCompleted: function() {
      if(this.completed) {
        this.$template.addClass('completed');
      } else  {
        this.$template.removeClass('completed');
      }
    },
    edit: function() {
      this.$template.addClass('editing');
      this.$template.find('.edit').focus();
    },
    editing: function(evt) {
      if(evt.keyCode != 13) return;
      this.editDone();
    },
    editDone: function() {
      var text = this.$template.find('.edit').val();
      $(window).trigger('ENTER_ITEM', [this.id, text]);
      this.$template.find('.edit').val('');
    },
    clickToggle: function() {
      if(this.completed) {
        $(window).trigger('CLICK_UNDO_COMPLETE', [this.id]);
      } else {
        $(window).trigger('CLICK_COMPLETE', [this.id]);
      }
    },
    clickDestroy: function() {
      $(window).trigger('CLICK_DESTROY', [this.id]);
    },
    events: function() {
      this.$template.on('click', '.toggle', this.clickToggle.bind(this));
      this.$template.on('click', '.destroy', this.clickDestroy.bind(this));
      this.$template.on('click', 'label', this.edit.bind(this));
      this.$template.on('keydown', '.edit',  this.editing.bind(this));
      this.$template.on('blur', '.edit', this.editDone.bind(this));
    },
    init: function() {
      this.events();
      this.isCompleted();
      return this.$template || false;
    }
  };

  // Main /////////////////////////////////////////////////////////////////////////////////////////
  var Main = function() {
    var collection = new Collection();
    collection.load('todoItems');
    var model = new Model(collection);
    new TextInput($('#new-todo'));
    new List($('#todo-list'), collection.items);
  };
  new Main();

})(app);
