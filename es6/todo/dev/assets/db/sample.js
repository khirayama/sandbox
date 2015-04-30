'use strict';
//1.indexedDB関連オブジェクトの取得
var indexedDB = window.indexedDB || window.webkitIndexedDB ||
                window.mozIndexedDB || window.msIndexedDB;
var IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction ||
                     window.mozIDBTransaction || window.msIDBTransaction;
var IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange ||
                  window.mozIDBKeyRange || window.msIDBKeyRange;
var IDBCursor = window.IDBCursor || window.webkitIDBCursor;

// indexedDB.deleteDatabase('app');
var idbReq = indexedDB.open('app', 1);
idbReq.onupgradeneeded = function (event) {
  var db = event.target.result;
  var todosStore = db.createObjectStore('todos', { keyPath: 'id' });
};

idbReq.onsuccess = function () {
  var db = idbReq.result;
  var transaction = db.transaction(['todos'], 'readwrite');
  var todosStore = transaction.objectStore('todos');

  todosStore.add({ id: '0', text: 'test', complate: false});
  todosStore.add({ id: '1', text: 'test2', complate: false});

  todosStore.openCursor().onsuccess = function (event) {
    var cursor = event.target.result;
    console.log(cursor, todosStore);
    if (cursor) {
      console.log('id:' + cursor.value.id + ' text: ' + cursor.value.text);
      cursor.continue();
    }
  };
};
