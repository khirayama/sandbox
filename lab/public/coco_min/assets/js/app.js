var app = app || {};
app.Model = app.Model || {};
app.Collection = app.Collection || {};
app.View = app.View || {};
app.Main = app.Main || {};

// on, trigger, text, html, append, remove, find, css
(function() {
  'use strict';
  // collection /////////////////////////////////////////////////////////////////////////////////////////
  app.Collection = {
    items: {},
    remove: function(url) {
      delete app.Collection.items[url];
      $(window).trigger('REMOVE_MODEL');
    },
    _save: function(key) {
      // app.Collection.itemsを保存する。クッキー？ローカルストレージ？
      localStorage.setItem(key, JSON.stringify(app.Collection.items));
    },
    load: function(key) {
      // クッキーかローカルストレージにあるitemsを読み込む。なければ、空のオブジェクト{}
      return JSON.parse(localStorage.getItem(key)) || {};
    },
    init: function() {
      $(window).on('CLICK_REMOVE', function(evt, url) {
        app.Collection.remove(url);
      });
      $(window).on('CREATE_MODEL REMOVE_MODEL', function() {
        app.Collection._save('clipItems');
      });
    }
  };
  app.Collection.init();

  // model /////////////////////////////////////////////////////////////////////////////////////////
  app.Model = {
    title: '',
    url: '',
    create: function(title, url) {
      app.Collection.items[url] = {
        'title': title,
        'url': url
      };
      $(window).trigger('CREATE_MODEL');
    },
    init: function() {
      $(window).on('CLICK_CLIP', function(evt, title, url) {
        app.Model.create(title, url);
      });
    }
  };
  app.Model.init();

  // view /////////////////////////////////////////////////////////////////////////////////////////
  app.View.BtnClip = function($dom) {
    this.$dom = $dom;
    this.title = $('title').text();
    this.url = location.pathname;
    this.active = true; // クリップ可能か（true: クリップする、false: クリップしました）
    this._isActive = function() {
      // app.Collection.items[this.url]が存在すればthis.activeをfalseに
      if(app.Collection.items[this.url]) {
        this.active = false;
      } else {
        this.active = true;
      }
      this._changeText();
    };
    this._changeText = function() {
      if(this.active) {
        this.$dom.addClass('active').text('クリップする').css('height', '100px').css({
          width: '50%'
        });
      } else {
        this.$dom.removeClass('active').text('クリップしました').css('height', '30px').css({
          width: '100%',
          background: 'blue'
        });
      }
    };
    this.init = function() {
      var _this = this;
      this._isActive();

      this.$dom.on('click', function() {
        if(_this.active) {
          $(window).trigger('CLICK_CLIP', [_this.title, _this.url]);
        } else {
          $(window).trigger('CLICK_REMOVE', [_this.url]);
        }
      });
      $(window).on('CREATE_MODEL REMOVE_MODEL', function(evt) {
        _this._isActive();
      });
    }
    this.init();
  };

  app.View.ListClip = function($dom, items) {
    this.$dom = $dom; // ul
    this.items = items;
    this.render = function(items) {
      this.$dom.find('li').remove(); // 一旦ulの中身を空にする
      if(Object.keys(items).length) {
        for(var key in items) {
          this.$dom.append(new app.View.ListItemClip(items[key].title, items[key].url));
        }
      } else {
        this.$dom.append('<li>まだクリップされたページはありません。</li>');
      }
    };
    this.init = function() {
      var _this = this;
      this.render(this.items);

      $(window).on('CREATE_MODEL REMOVE_MODEL', function() {
        _this.render(_this.items);
      });
    }
    this.init();
  };

  app.View.ListItemClip = function(title, url) {
    this.title = title;
    this.url = url;
    this.$dom = $('<li><a href="' + this.url + '">' + this.title + '</a><div class="removeItem">削除</div></li>');
    this.init = function() {
      var _this = this;
      this.$dom.find('.removeItem').on('click', function() {
        $(window).trigger('CLICK_REMOVE', [_this.url]);
      });
      return this.$dom;
    };
    return this.init();
  };

  // main /////////////////////////////////////////////////////////////////////////////////////////
  app.Main = function() {
    app.Collection.items = app.Collection.load('clipItems');
    if($('#clipBtn')) new app.View.BtnClip($('#clipBtn'));
    if($('#clipList')) new app.View.ListClip($('#clipList'), app.Collection.items);

    // テスト用Collectionを追加する場合
    // app.Model.create('test', '/coco/');
  };
  app.Main();
})();
