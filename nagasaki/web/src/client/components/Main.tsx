import * as React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  margin: 15px 30px;
`;

// TODO: Make Header
export const Main: React.SFC = ({ children }) => (
  <React.Fragment>
    <Container>{children}</Container>
  </React.Fragment>
);
