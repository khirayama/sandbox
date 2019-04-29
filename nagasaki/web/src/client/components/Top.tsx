import * as React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

import { ErrorProps, PageComponentWithError } from 'client/hocs/PageComponentWithError';

export interface Props extends ErrorProps {
  pathname: string;
  load: () => void;
}

const Icon = styled.img`
  border-radius: 50%;
  height: 120px;
  width: 120px;
`;

// TODO: Implement Head component
class TopComponent extends React.Component<Props> {
  constructor(props: Props) {
    super(props);

    props.load();
  }

  public render() {
    return (
      <React.Fragment>
        <h1>TOP Page</h1>
        <p>{this.props.pathname}</p>
        <ul>
          <li>
            {this.props.pathname === '/aaa' ? (
              <Link to='/'>TOP</Link>
            ) : (
              <Link to='/aaa'>aaa</Link>
            )}
          </li>
          <li>
            <Link to='/casdkjcasdjk'>Not Found</Link>
          </li>
        </ul>
        <p>DOTENV_TYPE: {process.env.DOTENV_TYPE}</p>
      </React.Fragment>
    );
  }
}

export const Top = PageComponentWithError<Props>()(TopComponent);
