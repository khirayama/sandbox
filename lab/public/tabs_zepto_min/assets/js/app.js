var app = app || {};

(function() {
  app.main = new Main();
})();

// on, trigger, addClass, removeClass, css, html, append
/* Class Main *************************************************************************************************************/
function Main() {
  this.init = function() {
    app.model = new Model();
    var i, $tabs = $('.tab'), $contents = $('.content');
    var length;
    length = $tabs.length;
    for (i = 0; i < length; i++) {
      new Tab($($tabs[i]), i);
    }
    length = $contents.length;
    for (i = 0; i < length; i++) {
      new Content($($contents[i]), i);
    }
  }
  this.init();
}

/* Class Model *************************************************************************************************************/
function Model() {
  this.index = 0;
  this._set = function(id) {
    this.index = id;
    $(app).trigger('CHANGE_INDEX');
  };
  this.init = function() {
    var _this = this;
    $(app).on('CLICK_TAB', function(evt, id) {
      _this._set(id);
    });
  };
  this.init();
}

/* Class Tab(View) *************************************************************************************************************/
function Tab($dom, id) {
  this.$dom = $dom;
  this.id = id;
  this.active = false;
  this.isActive = function() {
    if (this.id === app.model.index) {
      this.active = true;
    } else {
      this.active = false;
    }
    this._show();
  };
  this._show = function() {
    if (this.active === true) {
      this.$dom.addClass('active');
    } else {
      this.$dom.removeClass('active');
    }
  };
  this.init = function() {
    var _this = this;
    this.isActive();
    this.$dom.on('click', function() {
      $(app).trigger('CLICK_TAB', _this.id);
    });
    $(app).on('CHANGE_INDEX', function() {
      _this.isActive();
    });
  }
  this.init();
};

function Content($dom, id) {
  this.$dom = $dom;
  this.id = id;
  this.active = false;
  this.isActive = function() {
    if (this.id === app.model.index) {
      this.active = true;
    } else {
      this.active = false;
    }
    this._show();
  };
  this._show = function() {
    if (this.active === true) {
      this.$dom.addClass('active');
    } else {
      this.$dom.removeClass('active');
    }
  };
  this.init = function() {
    var _this = this;
    this.isActive();
    $(app).on('CHANGE_INDEX', function() {
      _this.isActive();
    });
  }
  this.init();
};
