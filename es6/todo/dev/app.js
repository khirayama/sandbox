import TodoTextInput from './assets/components/TodoTextInput';
import TodoList from './assets/components/TodoList';

let todoTextInputElements = document.querySelectorAll('#new-todo');
new TodoTextInput(todoTextInputElements[0]);

let todoListElements = document.querySelectorAll('#todo-list');
new TodoList(todoListElements[0]);
