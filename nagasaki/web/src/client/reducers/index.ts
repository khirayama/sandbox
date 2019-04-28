import { combineReducers } from 'redux';
import * as connectedReactRouter from 'connected-react-router';
import * as history from 'history';

import { reducer as usersReducer, State as UsersState } from './users';

export interface State {
  users: UsersState;
  router: connectedReactRouter.RouterState;
}

export const createRootReducer = (history: history.History) => combineReducers({
  router: connectedReactRouter.connectRouter(history),
  users: usersReducer,
});
