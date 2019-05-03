import * as React from 'react';
import { Link } from 'react-router-dom';
import * as styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';

import { increment, decrement } from 'client/actions';

const mapStateToProps = (state: any) => {
  return state;
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    onCountUpClick: () => {
      dispatch(increment());
    },
    onCountDownClick: () => {
      dispatch(decrement());
    }
  }
}

export function SampleComponent(props: any) {
  return (
    <>
      <div>
        <FormattedMessage
          id="SampleComponent.Hello"
          values={{name: 'khirayama'}}
        />
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/about/">About</Link>
            </li>
            <li>
              <Link to="/users/">Users</Link>
            </li>
          </ul>
        </nav>
        <div onClick={props.onCountUpClick}>COUNT UP</div>
        <div onClick={props.onCountDownClick}>COUNT DOWN</div>
        <div>{props.count}</div>
      </div>
    </>
  );
}

export const Sample = connect(mapStateToProps, mapDispatchToProps)(SampleComponent);
