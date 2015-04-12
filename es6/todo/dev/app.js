import Todo from './classes/model/Todo';
import AppDispatcher from './classes/dispatcher/AppDispatcher';
import TodoTextInput from './classes/viewController/TodoTextInput';

var todo = Todo.getAll();
var keys, id;
console.log(`nothing: ${JSON.stringify(todo)}`);

AppDispatcher.dispatch({
  actionType: 'TODO_CREATE',
  text: 'aaaa'
});
keys = Object.keys(todo);
id = keys[0];
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

AppDispatcher.dispatch({
  actionType: 'TODO_CREATE',
  text: 'nnnn'
});
keys = Object.keys(todo);
id = keys[0];
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

let todoTextInputElements = document.querySelectorAll('#new-todo');
new TodoTextInput(todoTextInputElements[0]);
