import * as React from 'react';
import * as styled from 'styled-components';

import { Head } from 'client/components/Head';

const Wrapper = styled.default.div`
  color: red;
`;

export function About() {
  return (
    <>
      <Head title="ABOUT" description="About | Sample" />
      <Wrapper>
        <h2>About</h2>
      </Wrapper>
    </>
  );
}
