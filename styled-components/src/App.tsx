import styled from 'styled-components';
import * as React from 'react';

class Title extends React.Component<any, any> {
  public render(): JSX.Element {
    return <h1 className={this.props.className}>Hello World</h1>;
  }
}

const StyledTitle = styled(Title)`
  font-size: 3rem;
  text-align: center;
  color: palevioletred;
`;

const Link = ({ className, children }) => (
  <a className={className}>
    {children}
  </a>
);

const StyledLink = styled(Link)`
  color: palevioletred;
  font-weight: bold;
`;

export class App extends React.Component<{}, {}> {
  public render(): JSX.Element {
    return (
      <>
      <Title />
      <StyledTitle />
      <StyledLink>Styled, exciting Link</StyledLink>
      </>
    );
  }
}
