import TodoTextInput from './classes/viewController/TodoTextInput';
import TodoList from './classes/viewController/TodoList';

let todoTextInputElements = document.querySelectorAll('#new-todo');
new TodoTextInput(todoTextInputElements[0]);

let todoListElements = document.querySelectorAll('#todo-list');
new TodoList(todoListElements[0]);
