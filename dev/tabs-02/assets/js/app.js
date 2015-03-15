var app = app || {};
app.Tabs = app.Tabs || {};
app.Tabs.Model = app.Model || {};
app.Tabs.View = app.View || {};

(function ($) {
	'use strict';
  // Model
  app.Tabs.Model = function(index) {
    this.index = index || this.index;
    this.init();
  }
  app.Tabs.Model.prototype = {
    index: 0,
    init: function() {
      var _this = this;
      $(window).on('CLICK_TAB', function(evt, id) {
        _this._set(id);
      });
    },
    _set: function(index) {
      this.index = index;
      $(this).trigger('CHANGE');
    }
  }
  window.model = new app.Tabs.Model();

  // View
  app.Tabs.View.Tab = function(id, $dom) {
    this.$dom = $dom || this.dom;
    this.id = id || this.id;
    this.init();
  };
  app.Tabs.View.Tab.prototype = {
    $dom: null,
    id: 0,
    active: false,
    init: function() {
      var _this = this;
      if(_this.id === 0) {
        _this.active = true;
        this._show();
      }
      this.$dom.on('click', function() {
        $(window).trigger('CLICK_TAB', _this.id);
      });
      $(model).on('CHANGE', function() {
        _this.isActive(model.index);
      });
    },
    isActive: function(index) {
      if(index === this.id) {
        this.active = true;
      } else {
        this.active = false;
      }
      this._show();
    },
    _show: function() {
      if(this.active) {
        this.$dom.addClass('active');
      } else {
        this.$dom.removeClass('active');
      }
    }
  };

  app.Tabs.View.Content = function(id, $dom) {
    this.$dom = $dom || this.dom;
    this.id = id || this.id;
    this.init();
  };
  app.Tabs.View.Content.prototype = {
    $dom: null,
    id: 0,
    active: false,
    init: function() {
      var _this = this;
      if(_this.id === 0) {
        _this.active = true;
        this._show();
      }
      $(model).on('CHANGE', function() {
        _this.isActive(model.index);
      });
    },
    isActive: function(index) {
      if(index === this.id) {
        this.active = true;
      } else {
        this.active = false;
      }
      this._show();
    },
    _show: function() {
      if(this.active) {
        this.$dom.addClass('active');
      } else {
        this.$dom.removeClass('active');
      }
    }
  };

  // Main
  app.Main = function() {
    var i;
    var $tabs = $('.tab');
    for(i = 0; i < $tabs.length; i++) {
      new app.Tabs.View.Tab(i, $($tabs[i]));
    }
    var $contents = $('.content');
    for(i = 0; i < $contents.length; i++) {
      new app.Tabs.View.Content(i, $($contents[i]));
    }
  };

  app.Main();

})(Zepto);
