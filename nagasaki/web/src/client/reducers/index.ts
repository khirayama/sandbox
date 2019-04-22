import { combineReducers } from 'redux';
import { RouterState } from 'connected-react-router';

import { reducer as usersReducer, State as UsersState } from 'client/reducers/users';
import { reducer as orgsReducer, State as OrgsState } from 'client/reducers/orgs';
import { reducer as pagesReducer, State as PagesState } from 'client/reducers/pages';

export interface State {
  users: UsersState;
  orgs: OrgsState;
  pages: PagesState;
  router: RouterState;
}

export const rootReducer = combineReducers({
  users: usersReducer,
  orgs: orgsReducer,
  pages: pagesReducer
});
