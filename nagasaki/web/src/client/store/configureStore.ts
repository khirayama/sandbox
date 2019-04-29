import { createStore, applyMiddleware } from 'redux';
import { routerMiddleware } from 'connected-react-router';
import * as history from 'history';
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly';

import { createRootReducer } from 'client/reducers';

declare var module: {
  hot: any;
};

export const his = process.env.IS_BROWSER ? history.createBrowserHistory() : history.createMemoryHistory();

const createEnhancer = () => {
  const composeEnhancers = composeWithDevTools({});

  return composeEnhancers(applyMiddleware(routerMiddleware(his)));
};

export const configureStore = (preloadedState: Object = {}) => {
  const enhancer = createEnhancer();
  const store = createStore(createRootReducer(his), preloadedState, enhancer);

  return store;
};
