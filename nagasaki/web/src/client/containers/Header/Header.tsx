import { connect } from 'react-redux';

import { State } from 'client/reducers';
import { Header as HeaderComponent } from 'client/components/Header';

const mapStateToProps = (state: State) => ({
  userName: state.users.name,
  orgName: state.orgs.name
});

export const Header = connect(mapStateToProps)(HeaderComponent);
