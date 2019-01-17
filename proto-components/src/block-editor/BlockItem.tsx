import * as React from 'react';

import { ContentEditableText } from 'block-editor/ContentEditableText';
import { doc } from 'block-editor/doc';
import { Clap } from 'block-editor/traverse';

interface IProps {
  indent: number;
  node: Clap.INode;
  focus?: boolean;
  onMoveUp: any;
  onMoveDown: any;
}

interface IState {
  caretPosition: number;
}

const keyCodes: any = {
  TAB: 9,
  ENTER: 13,
  UP: 38,
  DOWN: 40,
};

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

  public componentDidMount(): void {
    if (this.props.focus) {
      const el = this.contentRef.current.ref.current;
      if (el && el !== window.document.activeElement) {
        el.focus();
        const range: Range = document.createRange();
        if (el.firstChild) {
          range.setStart(el.firstChild as Node, el.innerText.length);
          range.setEnd(el.firstChild as Node, el.innerText.length);
          const selection: Selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    }
  }

  public componentDidUpdate(): void {
    if (this.props.focus) {
      const el = this.contentRef.current.ref.current;
      if (el && el !== window.document.activeElement) {
        el.focus();
        if (el.firstChild) {
          const range: Range = document.createRange();
          range.setStart(el.firstChild as Node, el.innerText.length);
          range.setEnd(el.firstChild as Node, el.innerText.length);
          const selection: Selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    }
  }

  public render(): JSX.Element {
    // contenteditableを使う理由
    // - textareaの場合、行数を自動で伸びるようにできない
    // - inputの場合、1行しか利用できない
    return (
      <div className="BlockItem" style={{marginLeft: `${this.props.indent}rem`}} onClick={() => {
        const sel = window.document.getSelection();
        this.setState({ caretPosition: sel.anchorOffset });
      }}>
        <span className="BlockItem--OneLine" ref={this.oneLineRef}>{this.props.node.text.substring(0, 1)}</span>
        <span className="BlockItem--Shadow" ref={this.shadowRef}>{this.props.node.text.substring(0, this.state.caretPosition + 1)}</span>
        <ContentEditableText
          ref={this.contentRef}
          value={this.props.node.text}
          onInput={(event: React.FormEvent<HTMLSpanElement>) => {
            const value: string = event.currentTarget.innerText;
            const node: Clap.Node = doc.rootNode.findNode(this.props.node.id);
            node.updateText(value);
          }}
          onKeyDown={(event) => {
            const keyCode: number = event.keyCode;
            const metaKey: boolean = event.metaKey;
            const shiftKey: boolean = event.shiftKey;

            this.command(keyCode, metaKey, shiftKey);
          }}
          onKeyUp={(event) => {
            // caret位置はKeyUpじゃないと正確な位置が取れない
            const sel = window.document.getSelection();
            this.setState({ caretPosition: sel.anchorOffset });
          }}
        />
      </div>
    );
  }

  private command(keyCode: number, metaKey: boolean, shiftKey: boolean): void {
    console.log(keyCode, metaKey, shiftKey);
    // tab: インデント
    // tab + shift: インデントを解除
    // enter: アイテム追加
    // up: 上移動
    // down: 下移動
    switch (true) {
      case (keyCodes.TAB === keyCode && !shiftKey): {
        event.preventDefault();
        this.indent();
        break;
      }
      case (keyCodes.TAB === keyCode && shiftKey): {
        event.preventDefault();
        this.unindent();
        break;
      }
      case (keyCodes.ENTER === keyCode): {
        break;
      }
      case (keyCodes.UP === keyCode): {
        const rows = this.getRows();
        if (rows.current === 1) {
          event.preventDefault();
          this.moveUp();
        }
        break;
      }
      case (keyCodes.DOWN === keyCode): {
        const rows = this.getRows();
        if (rows.current === rows.all) {
          event.preventDefault();
          this.moveDown();
        }
        break;
      }
    }
  }

  // Basic Commands
  private indent(): void {
    // - targetNodeをprevNodeに挿入
    const node: Clap.Node = doc.rootNode.findNode(this.props.node.id);
    const prevNode: Clap.Node = node.findPrevNode();
    if (node !== null && prevNode !== null) {
      prevNode.appendNode(node);
    }
  }

  private unindent(): void {
    // - nextNode以降のnodeをtargetNode.nodesにappend
    // - targetNode.parentNodeの次に挿入(after)
    const node: Clap.Node = doc.rootNode.findNode(this.props.node.id);
    if (node.parentNode && node.parentNode.parentNode) {
      while(true) {
        const nextNode: Clap.Node = node.findNextNode();
        if (nextNode === null) {
          break;
        } else {
          node.appendNode(nextNode);
        }
      }
      node.parentNode.after(node);
    }
  }

  private moveUp(): void {
    if (this.props.onMoveUp) {
      this.props.onMoveUp();
    }
  }

  private moveDown(): void {
    if (this.props.onMoveDown) {
      this.props.onMoveDown();
    }
  }

  private getRows(): { current: number, all: number } {
    // BlockItemを移動するときに、1行目/最終行目の場合、次のBlockItemに移動する
    const height = this.contentRef.current.ref.current.offsetHeight;
    const currentHeight = this.shadowRef.current.offsetHeight;
    const oneLineHeight = this.oneLineRef.current.offsetHeight || 1;

    const rows = {
      current: Math.floor(currentHeight / oneLineHeight),
      all: Math.floor(height / oneLineHeight),
    };

    return rows;
  }
}
