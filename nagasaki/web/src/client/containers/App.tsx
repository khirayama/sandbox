import * as React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';

import { loadAppProcess } from 'client/actions/pages';
import { App as AppComponent } from 'client/components/App';

const mapDispatchToProps = (dispatch: Dispatch) => ({
  load: () => {
    dispatch(loadAppProcess());
  }
});

export const App = connect(
  null,
  mapDispatchToProps
)(AppComponent);

