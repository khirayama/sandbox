import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import * as connectedReactRouter from 'connected-react-router';
import * as history from 'history';
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly';

import { createRootReducer } from '../reducers';
import { rootSaga } from '../sagas';

export const his = process.env.IS_BROWSER ? history.createBrowserHistory() : history.createMemoryHistory();
const sagaMiddleware = createSagaMiddleware();

const createEnhancer = () => {
  const composeEnhancers = composeWithDevTools({});

  return composeEnhancers(applyMiddleware(sagaMiddleware, connectedReactRouter.routerMiddleware(his)));
};

export const runSaga = async () => {
  // return sagaMiddleware.run(rootSaga).done;
  return sagaMiddleware.run(rootSaga).toPromise;
};

export const configureStore = (preloadedState: Object = {}) => {
  const enhancer = createEnhancer();
  const store = createStore(createRootReducer(his), preloadedState, enhancer);

  runSaga();

  /* istanbul ignore next */
  if (module.hot) {
    module.hot.accept('../reducers', () => {
      const {
        rootReducer: nextReducer
      }: { rootReducer: typeof createRootReducer } = require('../reducers');

      store.replaceReducer(createRootReducer(his));
    });
  }

  return store;
};
