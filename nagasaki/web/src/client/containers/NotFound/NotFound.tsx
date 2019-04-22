import { Dispatch } from 'redux';
import { connect } from 'react-redux';

import { NotFound as NotFoundComponent } from 'client/components/pages/NotFound';
import { stopSaga } from 'client/actions/pages';

const mapDispatchToProps = (dispatch: Dispatch) => ({
  stopSaga: () => {
    dispatch(stopSaga());
  }
});

export const NotFound = connect(
  null,
  mapDispatchToProps
)(NotFoundComponent);
