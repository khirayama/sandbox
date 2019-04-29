import * as React from 'react';
import { Route, Link } from 'react-router-dom';
import loadable from '@loadable/component';

const LoadableIndex = loadable((): any => import(/* webpackChunkName: "home" */'presentations/components/Home').then(({ Home }) => Home));
const LoadableAbout = loadable((): any => import(/* webpackChunkName: "about" */'presentations/components/About').then(({ About }) => About));
const LoadableUsers = loadable((): any => import(/* webpackChunkName: "users" */'presentations/components/Users').then(({ Users }) => Users));

export function SampleComponent() {
  return (
    <div>
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
      <Route exact path="/" component={LoadableIndex} />
      <Route exact path="/about/" component={LoadableAbout} />
      <Route exact path="/users/" component={LoadableUsers} />
    </div>
  );
}
