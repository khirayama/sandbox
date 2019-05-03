import * as React from 'react';
import { Route, Link } from 'react-router-dom';
import loadable from '@loadable/component';
import * as styled from 'styled-components';
import { FormattedMessage, IntlProvider, injectIntl } from 'react-intl';
import { connect } from 'react-redux';

import { Home } from 'client/components/Home';
import { increment, decrement } from 'client/actions';
import { chooseLocale } from 'client/components/SampleComponent.locale';

// const LoadableHome = loadable((): any => import(/* webpackChunkName: "home" */'presentations/components/Home').then(({ Home }) => Home));
const LoadableAbout = loadable((): any => import(/* webpackChunkName: "about" */'client/components/About').then(({ About }) => About));
const LoadableUsers = loadable((): any => import(/* webpackChunkName: "users" */'client/components/Users').then(({ Users }) => Users));

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

const mapStateToProps = (state: any) => {
  return state;
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

        <Route exact path="/" component={Home} />
        <Route exact path="/about/" component={LoadableAbout} />
        <Route exact path="/users/" component={LoadableUsers} />
      </div>
    </>
  );
}

export const Sample = connect(mapStateToProps, mapDispatchToProps)(SampleComponent);
