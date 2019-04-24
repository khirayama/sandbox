import * as React from 'react';
import styled from 'styled-components';
import { Head } from '../../Head';
import { OrganizationsBox } from '../../OrganizationsBox';
import { ErrorProps, PageComponentWithError } from '../../../hocs/PageComponentWithError';

export interface Props extends ErrorProps {
  load: () => void;
}

const Icon = styled.img`
  border-radius: 50%;
  height: 120px;
  width: 120px;
`;

class TopComponent extends React.Component<Props> {
  constructor(props: Props) {
    super(props);

    props.load();
  }

  render() {
    return (
      <React.Fragment>
        <Head title="top" />
        <p>DOTENV_TYPE: {process.env.DOTENV_TYPE}</p>
      </React.Fragment>
    );
  }
}

export const Top = PageComponentWithError<Props>()(TopComponent);
