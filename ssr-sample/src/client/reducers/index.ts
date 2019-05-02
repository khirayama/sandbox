import { Action } from 'redux';

export interface State {
  count: number;
}

export const initialState: State = {
  count: 1,
};

export function reducer(state = initialState, action: Action) {
  switch (action.type) {
    case 'INCREMENT': {
      return {
        count: state.count + 1,
      };
      break;
    }
    case 'DECREMENT': {
      return {
        count: state.count - 1,
      };
      break;
    }
    default:
  }
  return state;
}
