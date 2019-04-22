import * as React from 'react';
import { Route, Switch } from 'react-router-dom';

import { App } from 'client/containers/App';
import { LoadableTop, LoadableOrgs, LoadableNotFound } from 'client/Router/Routes';

export const Router = () => (
  <App>
    <Switch>
      <Route exact path="/" component={LoadableTop} />
      <Route path="/orgs/:org" component={LoadableOrgs} />
      <Route component={LoadableNotFound} />
    </Switch>
  </App>
);
