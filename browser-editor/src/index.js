const CodeMirror = require('codemirror/lib/codemirror');
// keyMap
require('codemirror/keymap/emacs');
require('codemirror/keymap/sublime');
require('codemirror/keymap/vim');
require('codemirror/addon/dialog/dialog');

// mode
require('codemirror/mode/markdown/markdown');

window.addEventListener('DOMContentLoaded', () => {
  console.log(`Start app at ${new Date().toString()}.`);

  const textareaElement = document.querySelector('.editor');

  // Options: https://codemirror.net/doc/manual.html#config
  const options = {
    mode: 'javascript',
    lineSeparator: '',
    theme: 'default',
    indentUnit: 2,
    smartIndent: true,
    tabSize: 2,
    indentWithTabs: false,
    electricChars: true,
    rtlMoveVisually: false,
    keyMap: window.localStorage.getItem('__editor_keyMap') || 'default',
    lineWrapping: false,
    lineNumbers: true,
    firstLineNumber: 1,
    autofocus: true,
    cursorScrollMargin: 8,
  };
  const editor = CodeMirror.fromTextArea(textareaElement, options);

  const selectElements = document.querySelectorAll('select');
  for (let i = 0; i < selectElements.length; i++) {
    const selectElement = selectElements[i];
    const initValue = window.localStorage.getItem(`__editor_${selectElement.name}`);
    if (initValue) {
      selectElement.value = initValue;
    }
    selectElement.addEventListener('change', (event) => {
      const el = event.currentTarget;
      editor.setOption(el.name, el.value);
      window.localStorage.setItem(`__editor_${el.name}`, el.value);
    });
  }
});
