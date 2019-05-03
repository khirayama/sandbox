import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';

import { increment, decrement } from 'client/actions';

const mapStateToProps = (state: any) => {
  return state;
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    onCountUpClick: () => {
      dispatch(increment());
    },
    onCountDownClick: () => {
      dispatch(decrement());
    },
  };
};

export function Component(props: any) {
  return (
    <div>
      <div onClick={props.onCountUpClick}>COUNT UP</div>
      <div onClick={props.onCountDownClick}>COUNT DOWN</div>
      <div>
        <FormattedMessage id="Counter.Label" values={{ name: 'khirayama' }} />
        {props.count}
      </div>
    </div>
  );
}

export const Counter = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Component);
