import { Dispatch } from 'redux';
import { connect } from 'react-redux';

import { Counter as Component } from 'client/components/common/Counter';
import { increment, decrement } from 'client/actions';
import { State } from 'client/reducers';

const mapStateToProps = (state: State) => {
  return {
    count: state.count,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    onCountUpClick: () => {
      dispatch(increment());
    },
    onCountDownClick: () => {
      dispatch(decrement());
    },
  };
};

export const Counter = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Component);
