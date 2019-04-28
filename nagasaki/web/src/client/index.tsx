import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
// import { loadComponents } from 'loadable-components';

import { configureStore, his } from './store/configureStore';
import { Router } from './Router'; // this needs to be at the top level because it's used by loadable-components

if (process.env.NODE_ENV !== 'production' && process.env.IS_BROWSER) {
  const { whyDidYouUpdate } = require('why-did-you-update');

  whyDidYouUpdate(React);
}

if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/public/service-worker.js');
  });
}

const renderMethod = module.hot ? ReactDOM.render : ReactDOM.hydrate;
const initialData = JSON.parse(document.getElementById('initial-data')!.getAttribute('data-json')!);
const store = configureStore(initialData);

const render = (RouterComponent: typeof Router) => {
  renderMethod(
    <Provider store={store}>
      <ConnectedRouter history={his}>
        <RouterComponent />
      </ConnectedRouter>
    </Provider>,
    document.getElementById('root')
  );
};

// loadComponents().then(() => {
//   render(Router);
// });

if (module.hot) {
  module.hot.accept('./Router', () => {
    const { Router: RouterComponent }: { Router: typeof Router } = require('./Router');

    render(RouterComponent);
  });
}