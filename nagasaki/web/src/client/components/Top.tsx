import * as React from 'react';
import styled from 'styled-components';

import { ErrorProps, PageComponentWithError } from 'client/hocs/PageComponentWithError';

export interface Props extends ErrorProps {
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

  render() {
    return (
      <React.Fragment>
        <h1>TOP Page</h1>
        <p>DOTENV_TYPE: {process.env.DOTENV_TYPE}</p>
      </React.Fragment>
    );
  }
}

export const Top = PageComponentWithError<Props>()(TopComponent);
