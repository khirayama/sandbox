import Todo from './classes/model/Todo';
import AppDispatcher from './classes/dispatcher/AppDispatcher';

var todo = Todo.getAll();

console.log(`nothing: ${JSON.stringify(todo)}`);

AppDispatcher.dispatch({
  actionType: 'TODO_CREATE',
  text: 'aaaa'
});
var keys = Object.keys(todo);
var id = keys[0];
console.log(`create: ${JSON.stringify(todo)}`);

AppDispatcher.dispatch({
  actionType: 'TODO_COMPLETE',
  id: id
});
console.log(`toggle to true: ${JSON.stringify(todo)}`);

AppDispatcher.dispatch({
  actionType: 'TODO_UNDO_COMPLETE',
  id: id
});
console.log(`toggle to false: ${JSON.stringify(todo)}`);

AppDispatcher.dispatch({
  actionType: 'TODO_DESTROY',
  id: id
});
console.log(`destory: ${JSON.stringify(todo)}`);
