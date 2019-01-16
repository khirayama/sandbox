import * as React from 'react';

import { ContentEditableText } from 'block-editor/ContentEditableText';
import { doc } from 'block-editor/doc';
import { Clap } from 'block-editor/traverse';

interface IProps {
  indent: number;
  node: Clap.INode;
}

interface IState {
  caretPosition: number;
}

export class BlockItem extends React.Component<IProps, IState> {
  private contentRef: React.RefObject<ContentEditableText>;

  private shadowRef: React.RefObject<HTMLSpanElement>;

  private oneLineRef: React.RefObject<HTMLSpanElement>;

  constructor(props: any) {
    super(props);

    // FYI: textarea / contenteditableの中で何行目か取得できるようにする。
    // 上下キーで移動するときに、最上行か最下行か判別が必要。仕組みとしては、以下。
    // - oneLineRefの要素で一行の高さを取得する
    // - shadowRefでcaret位置までの要素を書き出して現在位置までの長さの場合の高さを取得する
    // - contentRefで要素全体の高さを取得する
    // - そこから、{今の行数}/{全体の行数}と計算する
    this.contentRef = React.createRef();
    this.shadowRef = React.createRef();
    this.oneLineRef = React.createRef();

    const sel = window.document.getSelection();

    this.state = {
      caretPosition: sel.anchorOffset,
    };
  }

  public render(): JSX.Element {
    // contenteditableを使う理由
    // - textareaの場合、行数を自動で伸びるようにできない
    // - inputの場合、1行しか利用できない
    return (
      <div className="BlockItem" style={{marginLeft: `${this.props.indent}rem`}} onClick={() => {
        const sel = window.document.getSelection();
        this.setState({ caretPosition: sel.anchorOffset });

        this.showLineNumberInTextarea();
      }}>
        <span className="BlockItem--OneLine" ref={this.oneLineRef}>{this.props.node.text.substring(0, 1)}</span>
        <span className="BlockItem--Shadow" ref={this.shadowRef}>{this.props.node.text.substring(0, this.state.caretPosition || 1)}</span>
        <ContentEditableText
          ref={this.contentRef}
          value={this.props.node.text}
          onInput={(event: React.FormEvent<HTMLSpanElement>) => {
            const value: string = event.currentTarget.innerText;
            // this.props.traverse.updateText(this.props.node.id, value);
            // this.setState({ node: this.props.node.getNode() });
            const node: Clap.Node = doc.rootNode.findNode(this.props.node.id);
            node.updateText(value);
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
      // BlockItemを移動するときに、1行目/最終行目の場合、次のBlockItemに移動する
      const height = this.contentRef.current.ref.current.offsetHeight;
      const currentHeight = this.shadowRef.current.offsetHeight;
      const oneLineHeight = this.oneLineRef.current.offsetHeight || 1;
      console.log(`今、${Math.floor(height / oneLineHeight)}行中、${Math.floor(currentHeight / oneLineHeight)}行目です。`);
    }, 0);
  }
}
