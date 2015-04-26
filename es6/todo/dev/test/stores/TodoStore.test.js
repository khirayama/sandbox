'use strict';
import Todo from '../../assets/stores/TodoStore';
import assert from 'assert';

describe('TodoStore', function(){
  let todos, key, todo;
  before(function() {
    Todo._create('foo');
    todos = Todo.getAll();
    key = Object.keys(todos)[0];
    todo = todos[key];
  });
  describe('_create()', function(){
    it('create an item', function() {
      assert.equal(todo.text, 'foo');
      assert.equal(todo.complete, false);
    });
  });
  describe('_update()', function(){
    it('update an item', function() {
      Todo._update(key, {text: 'foofoo'});
      todo = todos[key];
      assert.equal(todo.text, 'foofoo');
    });
  });
  describe('_destroy()', function(){
    it('destroy an item', function() {
      Todo._destroy(key);
      todo = todos[key];
      assert.equal(todo, undefined);
    });
  });
});
