import { connect } from 'react-redux';

import { Application as Component } from 'client/components/Application';
import { State } from 'client/reducers';

const mapStateToProps = (state: State) => {
  return {
    locale: state.ui.locale,
  };
};

export const Application = connect(
  mapStateToProps,
  null,
)(Component);
