import * as React from 'react';

import { ContentEditableText } from 'components/ContentEditableText';
import { doc } from 'doc';
import { Clap } from 'clap';

interface IProps {
  indent: number;
  block: Clap.Block;
}

interface IState {
  caretPosition: number;
}

const keyCodes: any = {
  DELETE: 8,
  TAB: 9,
  ENTER: 13,
  UP: 38,
  DOWN: 40,
};

export class BlockItem extends React.Component<IProps, IState> {
  public render(): JSX.Element {
    const block = this.props.block;
    return <div key={block.id}>{block.text}</div>
  }
}
