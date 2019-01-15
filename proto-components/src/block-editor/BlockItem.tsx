import * as React from 'react';

import { ContentEditableText } from 'block-editor/ContentEditableText';

export class BlockItem extends React.Component<any, any> {
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
    // TODO: 同じブロックの共同編集はブロックする方針だし、ContentEditableの意味はなさそう？
    // textareaで普通に行けそう（inputだと1行表示しかできない）
    // inline表現はmarkdownを踏襲。入力中は全てテキストでよし。
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
