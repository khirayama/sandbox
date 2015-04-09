var app = app || {};
app.Model = app.Model || {};
app.Collection = app.Collection || {};
app.View = app.View || {};
app.Main = app.Main || {};

(function() {
  'use strict';
  // collection /////////////////////////////////////////////////////////////////////////////////////////
  app.Collection = function() {
    this.items = {};
    this.remove = function(id) {
      delete this.items[id];
      $(window).trigger('MODEL_DELETE');
    };
    this.get = function(id) {
      return this.items[id] || this.items;
    };
    this.save = function(key) {
      console.table(this.items);
      localStorage.setItem(key, JSON.stringify(this.items));
    };
    this.load = function(key) {
      this.items = JSON.parse(localStorage.getItem(key)) || {};
    };
    this.init = function() {
      var _this = this;
      $(window).on('CLICK_DESTROY', function(evt, url) {
        _this.remove(url);
      });
      $(window).on('MODEL_CREATE MODEL_UPDATE MODEL_DELETE', function() {
        _this.save('todoItems');
      });
    };
    this.init();
  };

  // model /////////////////////////////////////////////////////////////////////////////////////////
  app.Model = function() {
    this.create = function(id, text) {
      var model = {
        id: id,
        text: text,
        completed: false
      };
      app.collection.items[id] = model;
      $(window).trigger('MODEL_CREATE');
    };
    this.update = function(id, key, value) {
      app.collection.items[id][key] = value;
      $(window).trigger('MODEL_UPDATE');
    };
    this.init = function() {
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
    };
    this.init();
  };

  // view /////////////////////////////////////////////////////////////////////////////////////////
  app.View.TextInput = function($dom) {
    this.$dom = $dom;
    this.init = function() {
      var _this = this;
      this.$dom.on('keydown', function(evt) {
        if(evt.keyCode != 13) return;
        var text = _this.$dom.val();
        var id = Math.round(Math.random() * 1000);
        _this.$dom.val('');
        $(window).trigger('ENTER_INPUT', [id, text]);
      });
    }
    this.init();
  };

  app.View.List = function($dom, items) {
    this.$dom = $dom;
    this.items = items;
    this.render = function(items) {
      this.$dom.html('');
      for(var key in items) {
        this.$dom.append(new app.View.ListItem(items[key].id, items[key].text, items[key].completed));
      }
    };
    this.init = function() {
      var _this = this;
      this.render(this.items);

      $(window).on('MODEL_CREATE MODEL_UPDATE MODEL_DELETE', function() {
        _this.render(_this.items);
      });
    }
    this.init();
  };

  app.View.ListItem = function(id, text, completed) {
    this.id = id;
    this.text = text;
    this.completed = completed;
    this.$template = $('<li><div class="view"><div class="toggle"></div><label>' + this.text + '</label><div class="destroy"></div></div><input class="edit" value="' + this.text + '"></li>');
    this.isCompleted = function() {
      if(this.completed) {
        this.$template.addClass('completed');
      } else  {
        this.$template.removeClass('completed');
      }
    };
    this.edit = function() {
      this.$template.addClass('editing');
      this.$template.find('.edit').focus();
    };
    this.editing = function(evt) {
      if(evt.keyCode != 13) return;
      this.editDone();
    };
    this.editDone = function() {
      var text = this.$template.find('.edit').val();
      $(window).trigger('ENTER_ITEM', [this.id, text]);
      this.$template.find('.edit').val('');
    };
    this.init = function() {
      var _this = this;

      this.$template.find('.toggle').on('click', function() {
        if(_this.completed) {
          $(window).trigger('CLICK_UNDO_COMPLETE', [_this.id]);
        } else {
          $(window).trigger('CLICK_COMPLETE', [_this.id]);
        }
      });
      this.isCompleted();

      this.$template.find('.destroy').on('click', function() {
        $(window).trigger('CLICK_DESTROY', [_this.id]);
      });

      this.$template.find('label').on('click', this.edit.bind(this));
      this.$template.find('.edit').on('keydown', this.editing.bind(this));
      this.$template.find('.edit').on('blur', this.editDone.bind(this));

      return this.$template || false;
    };
    return this.init();
  };

  // main /////////////////////////////////////////////////////////////////////////////////////////
  app.Main = function() {
    app.model = new app.Model();
    app.collection = new app.Collection();
    app.collection.load('todoItems');
    new app.View.TextInput($('#new-todo'));
    new app.View.List($('#todo-list'), app.collection.items);
  };
  app.Main();
})();
