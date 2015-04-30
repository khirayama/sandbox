'use strict';
var modules = {
  db: null,
  renderer: function(todo) {
    var li = document.createElement('li');
    li.innerHTML = todo.text + ':' + todo.timeStamp;
    document.getElementById("todo-list").appendChild(li);
  }
};

// 初期化のメソッドを定義してみる
modules.init = function() {
  // ここで返るrequestは、「DBをopenするリクエスト」という意味
  var req = window.indexedDB.open('my_db', 103);
  // onupgradeneededは、indexedDB.openの第二引数のversionが
  // 既存のものよりも大きいときだけ呼ばれる
  // なので、StoreしたいObjectのSchemeを変えるときなどに使えばよろしい
  req.onupgradeneeded = function(ev) {
    var db = ev.target.result;
    ev.target.transaction.onerror = function(err) { console.log("XXX0", err); };
    // Scheme変えるわけだし、既に存在してるなら削除しとく
    // これをしないと、Table already existsに似たエラーを吐く
    if (db.objectStoreNames.contains('todo')) {
      db.deleteObjectStore('todo');
    }
    // 改めてつくる
    var store = db.createObjectStore('todo', {keyPath:'timeStamp'});
    console.log("XXX1", store);
  };
  // 「DBをopenするリクエスト」が成功に終われば、
  // 得られた結果はDBなので、保持しておく
  // あとはこの単一オブジェクトを使えばよろしい
  req.onsuccess = function(ev) {
    modules.db = (ev.target) ? ev.target.result : ev.result;
    // ま、ついでだしgetAllすっか
    modules.getAll(modules.renderer);
  };
};

// TODOを追加するメソッドを定義してみる
modules.addTodo = function(text) {
  var db = modules.db;
  // DBからObjectStoreへのトランザクションを生成する
  // この段階で"todo"というObjectStoreをつくってないと
  // 当然、Table name not found に似たエラーを吐く
  var tx = db.transaction(["todo"],"readwrite");
  // このトランザクション内でアクティブなObjectを生成する
  var store = tx.objectStore("todo");
  // putするリクエストを生成
  var req = store.put({text: text, timeStamp: Date.now()});
  // 「putするリクエスト」が成功したら...
  tx.oncomplete = function() { modules.getAll(modules.renderer); };
  // 「putするリクエスト」が失敗したら...
  tx.onerror = function(err) { console.log("xxx2", err); };
};

// TODOをすべて取得するメソッドを定義してみる
modules.getAll = function(renderer) {
  if (renderer) document.getElementById('todo-list').innerHTML = '';
  // このへんは同じ
  var db = modules.db;
  var tx = db.transaction(["todo"],"readwrite");
  var store = tx.objectStore("todo");
  // keyPathに対して検索をかける範囲を取得
  var range = IDBKeyRange.lowerBound(0);
  // その範囲を走査するカーソルリクエストを生成
  var cursorRequest = store.openCursor(range);
  // カーソルリクエストが成功したら...
  cursorRequest.onsuccess = function(e) {
    var result = e.target.result;
    // 注）走査すべきObjectがこれ以上無い場合
    //     result == null となります！
    if (!!result == false) return;
    // ここにvalueがくる！
    console.log(result.value);
    if (renderer) renderer(result.value);
    // カーソルを一個ずらす
    result.continue();
  }
  // カーソルリクエストが失敗したら...
  cursorRequest.onerror = function(err) {
    console.log("XXX3", err);
  }
};

modules.add = function() {
  var text = document.getElementById('todo-text').value;
  modules.addTodo(text);
};

(function(){
  modules.init();
})();
