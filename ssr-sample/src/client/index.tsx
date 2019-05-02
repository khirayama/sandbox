import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createStore, Action } from 'redux';

import { Sample } from 'client/components/SampleComponent';

// type Action = {
//   type: string;
//   payload?: any;
//   meta?: any;
//   error?: any;
// }
//
function extractInitialState() {
  const initialDataElement = window.document.querySelector('#initial-data');
  if (initialDataElement) {
    const initialDataString = initialDataElement.getAttribute('data-json');
    if (initialDataString) {
      return JSON.parse(initialDataString);
    } else {
      return {
        count: 0,
      };
    }
  }
}

function counter(state: any, action: Action) {
  switch (action.type) {
    case 'INCREMENT': {
      state.count + 1;
    }
    case 'DECREMENT': {
      state.count - 1;
    }
    default: {
      return state;
    }
    return state;
  }
}

const store = createStore(counter, extractInitialState());

window.addEventListener('DOMContentLoaded', () => {
  ReactDOM.hydrate(
    <BrowserRouter>
      <Provider store={store}>
        <Sample />
      </Provider>
    </BrowserRouter>,
    window.document.querySelector('#root'));
});
