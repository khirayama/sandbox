import * as React from 'react';

import { BlockItem } from 'block-editor/BlockItem';
import { doc } from 'block-editor/doc';
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
      nodeElements.push(
        <BlockItem
          key={node.id}
          indent={indent}
          node={node}
          focus={this.state.ui.focusId === node.id}
          onMoveUp={() => {
            const targetNode: Clap.Node = doc.rootNode.findNode(node.id);
            let upperNode: Clap.Node | null = null;
            let prevNode: Clap.Node | null = targetNode.findPrevNode();
            if (prevNode) {
              upperNode = prevNode;
              while (true) {
                if (upperNode && upperNode.nodes && upperNode.nodes.length) {
                  upperNode = upperNode.nodes[upperNode.nodes.length - 1];
                } else {
                  break;
                }
              }
            } else {
              upperNode = targetNode.parentNode;
            }
            if (upperNode) {
              this.setState({
                ui: {
                  focusId: upperNode.id,
                },
              });
            }
          }}
          onMoveDown={() => {
            const targetNode: Clap.Node = doc.rootNode.findNode(node.id);
            let downerNode: Clap.Node | null = null;
            let nextNode: Clap.Node = targetNode.findNextNode();
            if (targetNode.nodes && targetNode.nodes.length) {
              downerNode = targetNode.nodes[0];
            } else if (nextNode) {
              downerNode = nextNode;
            } else {
              downerNode = targetNode.parentNode;
              while(true) {
                if (downerNode === null) {
                  break;
                } else if (downerNode.findNextNode()) {
                  downerNode = downerNode.findNextNode();
                  break;
                } else {
                  downerNode = downerNode.parentNode;
                }
              }
            }
            if (downerNode) {
              this.setState({
                ui: {
                  focusId: downerNode.id,
                },
              });
            }
          }}
          onAdd={(newNode) => {
            this.setState({
              ui: {
                focusId: newNode.id,
              },
            });
          }}
        />
      );
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
