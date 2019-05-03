import { Action } from 'redux';

export interface State {
  count: number;
  ui: {
    locale: 'en' | 'ja';
  };
}

export const initialState: State = {
  count: 1,
  ui: {
    locale: 'en',
  },
};

export function reducer(state = initialState, action: any) {
  switch (action.type) {
    case 'INCREMENT': {
      return {
        count: state.count + 1,
        ui: state.ui,
      };
      break;
    }
    case 'DECREMENT': {
      return {
        count: state.count - 1,
        ui: state.ui,
      };
      break;
    }
    case 'CHANGE_LOCALE': {
      return {
        count: state.count,
        ui: {
          locale: action.payload.locale,
        },
      };
      break;
    }
    default:
  }
  return state;
}
