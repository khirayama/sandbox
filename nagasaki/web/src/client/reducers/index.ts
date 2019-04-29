import { combineReducers } from 'redux';
import * as history from 'history';
import { RouterState, connectRouter } from 'connected-react-router';

import { reducer as pagesReducer, State as PagesState } from 'client/reducers/pages';

export type State = {
  pages: PagesState;
  router: RouterState;
};

export const createRootReducer = (history: history.History) => combineReducers({
  pages: pagesReducer,
  router: connectRouter(history),
});
