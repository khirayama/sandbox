import * as React from 'react';
import * as styled from 'styled-components';

import { Navigation } from 'client/components/common/Navigation';

const Wrapper = styled.default.div`
  .Content {
    background: yellow;
  }
`;

export type Props = {
  children: React.ReactNode;
};

export function Application(props: Props) {
  return (
    <Wrapper>
      <Navigation />
      <div className="Content">{props.children}</div>
    </Wrapper>
  );
}
