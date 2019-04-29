import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { SampleComponent } from 'presentations/components/SampleComponent';

window.addEventListener('DOMContentLoaded', () => {
  ReactDOM.hydrate(<SampleComponent />, window.document.querySelector('#root'));
});
