import * as React from 'react';
import styled from 'styled-components'

import { BlockItem } from 'components/BlockItem';
import { doc } from 'doc';
import { Clap } from 'clap';

interface IProps {
  doc: Clap.Document;
}

interface IState {
  ui: {
    selectedBlockIds: string[];
  },
  doc: Clap.PureDocument;
}

const Wrapper = styled.div`
  color: red;
`;

// propsに渡るのはinstance
// stateに渡るのはpure object
export class Document extends React.Component<IProps, IState> {
  constructor(props: any) {
    super(props);

    const pureDoc = this.props.doc.toPureDocument();
    this.state = {
      ui: {
        selectedBlockIds: [pureDoc.blocks[0].id],
      },
      doc: pureDoc,
    };

    this.props.doc.addChangeListener(() => {
      console.log(this.props.doc.toPureDocument());
      this.setState({
        doc: this.props.doc.toPureDocument(),
      });
    });
  }

  public render(): JSX.Element {
    return (
      <Wrapper>
        {this.props.doc.blocks.map((block: Clap.Block): JSX.Element => <BlockItem key={block.id} block={block} />)}
      </Wrapper>
    );
  }
}
