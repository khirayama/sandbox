'use strict';
//1.indexedDB関連オブジェクトの取得
var indexedDB = window.indexedDB || window.webkitIndexedDB ||
                window.mozIndexedDB || window.msIndexedDB;
var IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction ||
                     window.mozIDBTransaction || window.msIDBTransaction;
var IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange ||
                  window.mozIDBKeyRange || window.msIDBKeyRange;
var IDBCursor = window.IDBCursor || window.webkitIDBCursor;
console.log(IDBTransaction, IDBKeyRange, IDBCursor);
var db;

//2.indexedDBを開く
var idbReq = indexedDB.open('archives', 1);

//3.DBの新規作成時、またはバージョン変更時に実行するコード
idbReq.onupgradeneeded = function (event) {
  var db = event.target.result;
  var twitterStore = db.createObjectStore('twitter', { keyPath: 'id_str' });
  var pocketStore = db.createObjectStore('pocket', { keyPath: 'item_id' });

  //データの追加
  twitterStore.add({ idStr: '1', text: 'test' });
  pocketStore.add({ itemId: '1', url:'http://test.com'});
};

//4-1.DBオープン失敗時の処理
idbReq.onerror = function (event) {
  console.log('error', event);
};

//4-2.DBオープン成功時の処理 
idbReq.onsuccess = function (event) {
  console.log(event);
  db = idbReq.result;
  //'twitter', 'pocket'2つのオブジェクトストアを読み書き権限付きで使用することを宣言
  var transaction = db.transaction(['twitter', 'pocket'], 'readwrite');
  //各オブジェクトストアの取り出し
  var twitterStore = transaction.objectStore('twitter');
  var pocketStore = transaction.objectStore('pocket');
  //twitterオブジェクトストアから全データの取り出し
  twitterStore.openCursor().onsuccess = function (event) {
    var cursor = event.target.result;
    if (cursor) {
      console.log('id_str:' + cursor.key + ' Text: ' + cursor.value.text);
      cursor.continue();
    }
  };
  //pocketオブジェクトストアからの全データの取り出し
  pocketStore.openCursor().onsuccess = function (event) {
    var cursor = event.target.result;
    if (cursor) {
      console.log('item_id:' + cursor.key + ' url: ' + cursor.value.url);
      cursor.continue();
    }
  };
};

console.log(db);
export default db;
