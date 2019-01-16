import * as React from 'react';

import { BlockItem } from 'block-editor/BlockItem';
import { Clap } from 'block-editor/traverse';

interface IProps {
  doc: Clap.Document;
}

interface IState {
  ui: {
    focusId: string;
  },
  node: Clap.INode;
}

export class Document extends React.Component<IProps, IState> {
  constructor(props: any) {
    super(props);

    const node = this.props.doc.rootNode.toPureNode();
    this.state = {
      ui: {
        focusId: node.nodes[0].id,
      },
      node,
    };

    this.props.doc.rootNode.addChangeListener(() => {
      this.setState({
        node: this.props.doc.rootNode.toPureNode(),
      });
    });
  }

  // Reactの特性上、DOMの構造が変わると新しいDOMが生成されてしまう
  // それによって、キャレット位置がリセットされるため、フラットにしてキャレットを維持する
  public renderNodes(nodes: Clap.INode[], indent: number = 0): JSX.Element[] {
    let nodeElements: JSX.Element[] = [];

    for (const node of nodes) {
      nodeElements.push(<BlockItem key={node.id} indent={indent} node={node} />);
      if (node.nodes && node.nodes.length) {
        const childChildrenElements: JSX.Element[] = this.renderNodes(node.nodes, indent + 1);
        nodeElements = nodeElements.concat(childChildrenElements);
      }
    }

    return nodeElements;
  }

  public render(): JSX.Element {
    const children: JSX.Element[] = this.renderNodes(this.state.node.nodes);

    return <div>{children}</div>
  }
}
