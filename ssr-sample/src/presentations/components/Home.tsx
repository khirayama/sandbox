import * as React from 'react';
import * as styled from 'styled-components';

const Wrapper = styled.default.div`
  color: blue;
`;

export function Home() {
  return (
    <Wrapper>
      <h2>Home</h2>
    </Wrapper>
  );
}
