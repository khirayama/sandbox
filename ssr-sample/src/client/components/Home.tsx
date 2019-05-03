import * as React from 'react';
import * as styled from 'styled-components';

import { Head } from 'client/components/Head';
import { Navigation } from 'client/components/Navigation';
import { Counter } from 'client/containers/Counter';

const Wrapper = styled.default.div`
  color: blue;
`;

export function Home() {
  // TODO: How to use react-intl for Head
  return (
    <>
      <Head title="HOME" description="Home | Sample" />
      <Navigation />
      <Wrapper>
        <h2>Home</h2>
        <Counter />
      </Wrapper>
    </>
  );
}
