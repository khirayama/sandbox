import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

import { SampleComponent } from 'presentations/components/SampleComponent';

window.addEventListener('DOMContentLoaded', () => {
  ReactDOM.hydrate(
    <BrowserRouter>
      <SampleComponent />
    </BrowserRouter>, window.document.querySelector('#root'));
});
