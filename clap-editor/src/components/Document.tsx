import * as React from 'react';

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

  // Reactの特性上、DOMの構造が変わると新しいDOMが生成されてしまう
  // それによって、キャレット位置がリセットされるため、フラットにしてキャレットを維持する
  public renderBlocks(blocks: Clap.Block[]): JSX.Element[] {
    return blocks.map((block: Clap.Block): JSX.Element => {
      return <div key={block.id}>{block.text}</div>
    });
  }

  public render(): JSX.Element {
    const children: JSX.Element[] = this.renderBlocks(this.props.doc.blocks);

    return <div>{children}</div>
  }
}
