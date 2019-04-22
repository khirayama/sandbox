import { State } from 'client/reducers';

export const getUsers = (state: State) => state.users;
export const getOrgs = (state: State) => state.orgs;
