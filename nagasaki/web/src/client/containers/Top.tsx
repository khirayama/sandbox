import { Dispatch } from 'redux';
import { connect } from 'react-redux';

import { Top as TopComponent } from 'client/components/Top';
import { loadTopPage } from 'client/actions/pages';
import { State } from 'client/reducers';

const mapStateToProps = (state: State) => {
  console.log(state);
  return {
    pathname: state.router.location.pathname,
    error: state.pages.error
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  load: () => {
    dispatch(loadTopPage());
  }
});

export const Top = connect(
  mapStateToProps,
  mapDispatchToProps
)(TopComponent);
