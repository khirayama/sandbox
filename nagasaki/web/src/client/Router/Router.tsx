import * as React from 'react';
import { Route, Switch } from 'react-router-dom';

import { App } from 'client/containers/App';

import { Top } from 'client/containers/Top';
import { NotFound } from 'client/containers/NotFound';

export const Router = () => (
  <App>
    <Switch>
      <Route exact path="/aaa" component={() => <h1>aaa</h1>} />
      <Route exact path="/" component={Top} />
      <Route component={NotFound} />
    </Switch>
  </App>
);
