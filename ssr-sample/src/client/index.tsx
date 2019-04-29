import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { SampleComponent } from 'presentations/components/SampleComponent';

window.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(<SampleComponent />, window.document.querySelector('#root'));
});
