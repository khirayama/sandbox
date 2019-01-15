import * as React from 'react';

import { Traverse, TPad } from 'block-editor/traverse';
import { BlockItem } from 'block-editor/BlockItem';

export class Pad extends React.Component<{}, any> {
  private traverse: Traverse;

  constructor(props: any) {
    super(props);

    this.traverse = new Traverse();

    this.state = {
      node: this.traverse.getNode(),
    };
  }

  // Reactの特性上、DOMの構造が変わると新しいDOMが生成されてしまう
  // それによって、キャレット位置がリセットされるため、フラットにしてキャレットを維持する
  public renderChildren(children: any[], indent: number = 0): JSX.Element[] {
    let childrenElements: JSX.Element[] = [];

    for (const child of children) {
      childrenElements.push(<BlockItem key={child.id} traverse={this.traverse} indent={indent} block={child} />);
      if (child.children && child.children.length) {
        const childChildrenElements: JSX.Element[] = this.renderChildren(child.children, indent + 1);
        childrenElements = childrenElements.concat(childChildrenElements);
      }
    }

    return childrenElements;
  }

  public render(): JSX.Element {
    const children: JSX.Element[] = this.renderChildren(this.state.node.children);

    return <div>{children}</div>
  }
}
