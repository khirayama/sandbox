import * as React from 'react';
/* Refs
  - ContentEditable のハマりどころと対処法 https://www.bokukoko.info/entry/2017/10/08/154950
  - inputの入力値の制御でIME入力とかいろいろ辛かった話 https://qiita.com/yanyan_ys/items/d14ecb3d2e5b7d119d5d
  - JavaScript における 日本語入力 確定 (Enter) イベント https://garafu.blogspot.com/2015/09/javascript-ime-enter-event.html?m=1
  - JavaScript とクロスブラウザでの IME event handling (2017年) https://tanishiking24.hatenablog.com/entry/ime-event-handling-javascript

  - 共同編集のためを考えたけど、結構厳しい
    - OT方式だと行けそうに感じるが...
    - IME起動時のキャレット位置や確定処理が不安定
      - isComposingは使えそうだった
        - ReactのEventは対応してなさそうだったので生DOMにつける必要あり
  - 一旦、入力をブロックする方式で
*/

interface IProps {
  value?: string;
  onInput?: (event: React.FormEvent<HTMLDivElement>) => void;
}

export class ContentEditableText extends React.Component<IProps, {}> {
  private ref: any;

  constructor(props: any) {
    super(props);

    this.ref = React.createRef();

    this.onInput = this.onInput.bind(this);
  }

  public shouldComponentUpdate(nextProps: any): boolean {
    const el = this.ref.current;
    const value = el.innerText;
    if (nextProps.value !== value) {
      const sel: any = window.getSelection();
      const start: number = sel.anchorOffset;
      const diff: number = 0; // 共同編集時に自分より前に差し込まれた場合

      el.innerText = nextProps.value;

      const range = window.document.createRange();
      range.setStart(el.firstChild, start + diff);
      range.setEnd(el.firstChild, start + diff);
      sel.removeAllRanges();
      sel.addRange(range);
    }

    return false;
  }

  public render(): JSX.Element {
    const value: string = this.props.value || '';

    // Chrome:  keydown - keypress - input - keyup
    // Firefox: keydown - keypress - input - keyup
    // Safari:  input - keydown - keyup
    return (
      <div
        ref={this.ref}
        contentEditable={true}
        suppressContentEditableWarning={true}
        onInput={this.onInput}
      >{value}</div>
    );
  }

  private onInput(event: React.FormEvent<HTMLDivElement>): void {
    if (this.props.onInput) {
      this.props.onInput(event);
    }
  }
}
