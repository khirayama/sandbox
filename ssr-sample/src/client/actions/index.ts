import { Action } from 'redux';

import { State } from 'client/reducers';

export type Actions = Increment | Decrement;

export interface Increment extends Action<'INCREMENT'> {}

export const increment = (): Increment => {
  return {
    type: 'INCREMENT',
  };
};

export interface Decrement extends Action<'DECREMENT'> {}

export const decrement = (): Decrement => {
  return {
    type: 'DECREMENT',
  };
};
