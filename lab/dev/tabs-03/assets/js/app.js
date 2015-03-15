var app = app || {}; //add

(function() { // $(function(){ $はずして即時間数化した。素のjsでいけるところでjQueryを呼び出さない。
  // window.main = new Main(); // global汚染
  app.main = new Main(); // app空間にくっつけることでglobal汚染を回避
})();

/* Class Main *************************************************************************************************************/
function Main() {
  // setupを削除してinitに統合。initはイニシャライズの略で初期化の意味。
  // setupもあると、initとsetupどちらが先か名前だけではわからないし、どう役割を分けているのかわからない
  this.init = function() {
    // window.model = new Model(); //global汚染
    app.model = new Model(); // app空間にくっつけることでglobal汚染を回避
    var i,
      $tabs = $('.tab'), // $のキャッシュはgood。jQueryの場合、かなり早くなる。変数名も$hogeはわかりやすくてとてもよい
      $contents = $('.content');

    // for文を長さで回す時には、lengthは一度外で取得したほうが、毎回参照に行かず少しだけ早い
    var length; // add
    length = $tabs.length; // add
    for (i = 0; i < length; i++) {
      new Tab($($tabs[i]), i);
    }
    length = $contents.length; // add
    for (i = 0; i < length; i++) {
      new Content($($contents[i]), i);
    }
  }
  this.init();
}

/* Class Model *************************************************************************************************************/
// Modelはgood。_setなどプライベートなのが伝わって、ありがたい。
// こういうコードを書く人と仕事したい
function Model() {
  this.index = 0; // 実は何を指してるかわかりにくい。よりわかりやすい変数名（例: currentTabIndexとか）にするか、コメントで説明を付与するとよりわかりやすくなる
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
// TabはViewの一種なので、ちょっとわかりやすくなるように空間をわけたり、変数名を工夫したり、コメントがあるとgood
// 例1）function app.View.Tab($dom, id) { :空間を分けた場合
// 例2）function TabView($dom, id) { :変数名を変えた場合
//      -> 例えば今回はModelは一個だけど同じページにカルーセルがあったら、Modelがふたつになる。とか想定すると、名前にViewとか入れてあげるとわかりやすくなる。
// 例3) function Tab($dom, id) { // Tab View :コメントを付ける場合
// === と == の違いを理解しているかは大事なポイント。基本的に===が好ましいが、シーンによっては==も選択する。今回はgood
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

// good!
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

// 全体として
// global汚染が激しいので、app空間などに閉じ込めたほうがいい。triggerの先もappに変更した
// +-*/%,;:(){}などのあとには半角スペースを推奨（僕はgoogleのコーディング規約に従ってる。） http://cou929.nu/data/google_javascript_style_guide/
// これだけ書ければ十分。あとはprototypeを理解したり、newやObjectなどの挙動がわかれば、ひとまず平山とは同じレベル。岩橋さんへの質問許可（笑）
