import * as React from 'react';
import * as styled from 'styled-components';

import { Head } from 'presentations/components/Head';

const Wrapper = styled.default.div`
  color: yellow;
`;

export function Users() {
  return (
    <>
      <Head title="USERS" description="Users | Sample" />
      <Wrapper>
        <h2>Users</h2>
      </Wrapper>
    </>
  );
}
