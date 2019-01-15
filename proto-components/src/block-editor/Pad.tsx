import * as React from 'react';

import { ContentEditableText } from 'block-editor/ContentEditableText';
import { Traverse, TPad } from 'block-editor/traverse';

// MEMO: キャレット位置で分割したテキストをいれたDOMをクローン。widthも必要かも。
// それでdisplay: inline-blockして高さから何行目か計算。とか？
// これ、before擬似要素でできないかな。

class BlockItem extends React.Component<any, any> {
  private contentRef: React.RefObject<ContentEditableText>;

  private shadowRef: React.RefObject<HTMLSpanElement>;

  private oneLineRef: React.RefObject<HTMLSpanElement>;

  constructor(props: any) {
    super(props);

    this.contentRef = React.createRef();
    this.shadowRef = React.createRef();
    this.oneLineRef = React.createRef();

    const sel = window.document.getSelection();

    this.state = {
      caretPosition: sel.anchorOffset,
    };
  }

  public render(): JSX.Element {
    return (
      <div className="Block" style={{marginLeft: `${this.props.indent}rem`}} onClick={() => {
        const sel = window.document.getSelection();
        this.setState({ caretPosition: sel.anchorOffset });

        this.showLineNumberInTextarea();
      }}>
        <span className="Block--OneLine" ref={this.oneLineRef}>{this.props.block.text.substring(0, 1)}</span>
        <span className="Block--Shadow" ref={this.shadowRef}>{this.props.block.text.substring(0, this.state.caretPosition || 1)}</span>
        <ContentEditableText
          ref={this.contentRef}
          value={this.props.block.text}
          onInput={(event: React.FormEvent<HTMLSpanElement>) => {
            const value: string = event.currentTarget.innerText;
            this.props.traverse.updateText(this.props.block.id, value);
            this.setState({ node: this.props.traverse.getNode() });
          }}
          onKeyUp={(event) => {
            const sel = window.document.getSelection();
            this.setState({ caretPosition: sel.anchorOffset });

            this.showLineNumberInTextarea();
          }}
        />
      </div>
    );
  }

  private showLineNumberInTextarea() {
    setTimeout(() => {
      // It's for moving BlockItem
      const height = this.contentRef.current.ref.current.offsetHeight;
      const currentHeight = this.shadowRef.current.offsetHeight;
      const oneLineHeight = this.oneLineRef.current.offsetHeight;
      console.log(`今、${Math.floor(height / oneLineHeight)}行中、${Math.floor(currentHeight / oneLineHeight)}行目です。`);
    }, 0);
  }
}

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
