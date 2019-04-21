import * as React from 'react';
import styled from 'styled-components'

import { doc } from 'doc';
import { Clap } from 'clap';

type Props = {
  block: Clap.Block;
};

type State = {
  caretPosition: number;
};

const keyCodes: any = {
  DELETE: 8,
  TAB: 9,
  ENTER: 13,
  UP: 38,
  DOWN: 40,
};

const Wrapper = styled.div`
  padding: 4px;
  margin: 0 0 0 ${props => `${props.indent * 1}em`};
`;

export class BlockItem extends React.Component<Props, State> {
  public render(): JSX.Element {
    const block = this.props.block;
    return <Wrapper key={block.id} indent={block.indent}>{block.text}</Wrapper>
  }
}
