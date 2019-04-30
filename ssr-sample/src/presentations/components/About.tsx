import * as React from 'react';
import * as styled from 'styled-components';

const Wrapper = styled.default.div`
  color: red;
`;

export function About() {
  return (
    <Wrapper>
      <h2>About</h2>
    </Wrapper>
  );
}
