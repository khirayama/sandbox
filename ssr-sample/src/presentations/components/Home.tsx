import * as React from 'react';
import * as styled from 'styled-components';

import { Head } from 'presentations/components/Head';

const Wrapper = styled.default.div`
  color: blue;
`;

export function Home() {
  return (
    <>
      <Head title="HOME" description="Home | Sample" />
      <Wrapper>
        <h2>Home</h2>
      </Wrapper>
    </>
  );
}
