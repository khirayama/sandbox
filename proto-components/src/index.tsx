import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { App } from 'components/App';

window.addEventListener('DOMContentLoaded', () => {
  console.log(`Start an app at ${new Date().toString()}.`);

  const el: HTMLElement = window.document.querySelector('.app');
  ReactDOM.render(<App />, el);
});
