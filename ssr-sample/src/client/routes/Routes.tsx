import * as React from 'react';
import loadable from '@loadable/component';
import { Route } from 'react-router-dom';

// FYI: If you want to do server side rendering, using normal import or install babel with typescript.
// loadable-components needs a babel plugin to do SSR.
import { Home } from 'client/components/Home';

// const LoadableHome = loadable((): any => import(/* webpackChunkName: "home" */'presentations/components/Home').then(({ Home }) => Home));
const LoadableAbout = loadable(
  (): any => import(/* webpackChunkName: "about" */ 'client/components/About').then(({ About }) => About),
);
const LoadableUsers = loadable(
  (): any => import(/* webpackChunkName: "users" */ 'client/components/Users').then(({ Users }) => Users),
);

export function Routes() {
  return (
    <>
      <Route exact path="/" component={Home} />
      <Route exact path="/about/" component={LoadableAbout} />
      <Route exact path="/users/" component={LoadableUsers} />
    </>
  );
}
