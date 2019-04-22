import { Dispatch } from 'redux';
import { connect } from 'react-redux';

import { App as AppComponent } from 'client/components/App';
import { loadAppProcess } from 'client/actions/pages';

const mapDispatchToProps = (dispatch: Dispatch) => ({
  load: () => {
    dispatch(loadAppProcess());
  }
});

export const App = connect(
  null,
  mapDispatchToProps
)(AppComponent);
