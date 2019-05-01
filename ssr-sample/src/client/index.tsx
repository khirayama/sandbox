import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createStore, Action } from 'redux';

import { Sample } from 'presentations/components/SampleComponent';

// type Action = {
//   type: string;
//   payload?: any;
//   meta?: any;
//   error?: any;
// }

function counter(state = 0, action: Action) {
  switch (action.type) {
    case 'INCREMENT':
      return state + 1
    case 'DECREMENT':
      return state - 1
    default:
      return state
  }
}

const store = createStore(counter);

window.addEventListener('DOMContentLoaded', () => {
  ReactDOM.hydrate(
    <Provider store={store}>
      <BrowserRouter>
        <Sample />
      </BrowserRouter>
    </Provider>,
    window.document.querySelector('#root'));
});
