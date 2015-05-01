'use strict';
// いろいろ定義してる。クロスブラウザ対策とか
var html5rocks = {};
var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB;
if ('webkitIndexedDB' in window) {
  // var IDBTransaction = window.webkitIDBTransaction;
  var IDBKeyRange = window.webkitIDBKeyRange;
}
html5rocks.indexedDB = {};
html5rocks.indexedDB.db = null;

// request: openする。接続する感じ
// transaction: しらん
// object:
// store:
// keypath: 

// ここから本番
html5rocks.indexedDB.onerror = function(e) { console.log(e); };
html5rocks.indexedDB.open = function() {
  var version = 1;
  var request = indexedDB.open('todos', version);
  // 初期化 - バージョン変更があったときに呼び出す
  request.onupgradeneeded = function(e) {
    var db = e.target.result;
    e.target.transaction.onerror = html5rocks.indexedDB.onerror;
    if(db.objectStoreNames.contains('todo')) db.deleteObjectStore('todo');
    db.createObjectStore('todo', {keyPath: 'timeStamp'});
  };
  // open成功時に実行される
  request.onsuccess = function(e) {
    html5rocks.indexedDB.db = e.target.result;
    html5rocks.indexedDB.getAllTodoItems();
  };
  request.onerror = html5rocks.indexedDB.onerror;
};

html5rocks.indexedDB.addTodo = function(todoText) {
  var db = html5rocks.indexedDB.db;
  var trans = db.transaction(['todo'], 'readwrite');
  var store = trans.objectStore('todo');
  var data = {
    text: todoText,
    timeStamp: new Date().getTime()
  };
  var request = store.put(data);
  request.onsuccess = function() {
    html5rocks.indexedDB.getAllTodoItems();
  };
  request.onerror = function(e) {
    console.log('Error Adding: ', e);
  };
};

html5rocks.indexedDB.deleteTodo = function(id) {
  var db = html5rocks.indexedDB.db;
  var trans = db.transaction(['todo'], 'readwrite');
  var store = trans.objectStore('todo');
  var request = store.delete(id);
  request.onsuccess = function() {
    html5rocks.indexedDB.getAllTodoItems();
  };
  request.onerror = function(e) {
    console.log('Error Adding: ', e);
  };
};

html5rocks.indexedDB.getAllTodoItems = function() {
  var todos = document.getElementById('todoItems');
  todos.innerHTML = '';
  var db = html5rocks.indexedDB.db;
  var trans = db.transaction(['todo'], 'readwrite');
  var store = trans.objectStore('todo');
  // Get everything in the store;
  var keyRange = IDBKeyRange.lowerBound(0);
  var cursorRequest = store.openCursor(keyRange);
  cursorRequest.onsuccess = function(e) {
    var result = e.target.result;
    if(!!result === false)
      return;
    renderTodo(result.value);
    result.continue();
  };
  cursorRequest.onerror = html5rocks.indexedDB.onerror;
};

// ここからviewな感じだ
function renderTodo(row) {
  var todos = document.getElementById('todoItems');
  var li = document.createElement('li');
  var a = document.createElement('a');
  var t = document.createTextNode(row.text);
  a.addEventListener('click', function() {
    html5rocks.indexedDB.deleteTodo(row.timeStamp);
  }, false);

  a.href = '#';
  a.textContent = ' [Delete]';
  li.appendChild(t);
  li.appendChild(a);
  todos.appendChild(li);
}
function addTodo() {
  var todo = document.getElementById('todo');
  html5rocks.indexedDB.addTodo(todo.value);
  todo.value = '';
}
function init() {
  html5rocks.indexedDB.open();
}
window.addEventListener('DOMContentLoaded', init, false);
