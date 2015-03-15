var app = app || {};
app.Model = app.Model || {};
app.Collection = app.Collection || {};
app.View = app.View || {};
app.Main = app.Main || {};

(function() {
  'use strict';
  // collection /////////////////////////////////////////////////////////////////////////////////////////
  app.Collection = {
    items: {},
    remove: function(url) {
      delete app.Collection.items[url];
      console.log('trigger REMOVE_MODEL by Collection', app.Collection.items);
      $(window).trigger('REMOVE_MODEL');
    },
    _save: function(key) {
      // app.Collection.itemsを保存する。クッキー？ローカルストレージ？
      console.log('save', app.Collection.items);
      localStorage.setItem(key, JSON.stringify(app.Collection.items));
    },
    load: function(key) {
      // クッキーかローカルストレージにあるitemsを読み込む。なければ、空のオブジェクト{}
      return JSON.parse(localStorage.getItem(key)) || {};
    },
    init: function() {
      $(window).on('CLICK_REMOVE', function(evt, url) {
        console.log('on CLICK_REMOVE by Collection', app.Collection.items);
        app.Collection.remove(url);
      });
      $(window).on('CREATE_MODEL REMOVE_MODEL', function() {
        console.log('on CREATE_MODEL REMOVE_MODEL by Collection', app.Collection.items);
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
      console.log('trigger CREATE_MODEL by Model', app.Collection.items);
      $(window).trigger('CREATE_MODEL');
    },
    init: function() {
      $(window).on('CLICK_CLIP', function(evt, title, url) {
        console.log('on CLICK_CLIP by Model', app.Collection.items);
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
      if(this.active) this.$dom.text('クリップする');
      if(!this.active) this.$dom.text('クリップしました');
    };
    this.init = function() {
      var _this = this;
      this._isActive();

      this.$dom.on('click', function() {
        console.log('on click by BtnClip', app.Collection.items);
        if(_this.active) {
          console.log('trigger CLICK_CLIP by BtnClip', app.Collection.items);
          $(window).trigger('CLICK_CLIP', [_this.title, _this.url]);
        } else {
          console.log('trigger CLICK_REMOVE by BtnClip', app.Collection.items);
          $(window).trigger('CLICK_REMOVE', [_this.url]);
        }
      });
      $(window).on('CREATE_MODEL REMOVE_MODEL', function(evt) {
        console.log('on CREATE_MODEL by BtnClip', app.Collection.items);
        _this._isActive();
      });
    }
    this.init();
  };

  app.View.ListClip = function($dom, items) {
    this.$dom = $dom; // ul
    this.items = items;
    this.render = function(items) {
      this.$dom.html(''); // 一旦ulの中身を空にする
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
        console.log('on CREATE_MODEL REMOVE_MODEL by ListClip', app.Collection.items);
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
        console.log('on click by ListItemClip', app.Collection.items);
        console.log('trigger CLICK_REMOVE by ListItemClip', app.Collection.items);
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
