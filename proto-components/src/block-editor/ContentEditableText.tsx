import * as React from 'react';
/* Refs
  - ContentEditable のハマりどころと対処法 https://www.bokukoko.info/entry/2017/10/08/154950
  - inputの入力値の制御でIME入力とかいろいろ辛かった話 https://qiita.com/yanyan_ys/items/d14ecb3d2e5b7d119d5d
  - JavaScript における 日本語入力 確定 (Enter) イベント https://garafu.blogspot.com/2015/09/javascript-ime-enter-event.html?m=1
  - JavaScript とクロスブラウザでの IME event handling (2017年) https://tanishiking24.hatenablog.com/entry/ime-event-handling-javascript
*/

interface IProps {
  value?: string;
  onInput?: (event: React.FormEvent<HTMLDivElement>) => void;
}

export class ContentEditableText extends React.Component<IProps, {}> {
  private ref: any;

  private isDispatch: boolean = true;

  constructor(props: any) {
    super(props);

    this.ref = React.createRef();

    this.onInput = this.onInput.bind(this);
  }

  public componentDidMount(): void {
    const el: HTMLDivElement = this.ref.current;
    el.addEventListener('keydown', (e: any) => {
      console.log('keydown', e.isComposing);
    });
    el.addEventListener('compostionstart', () => {
      console.log('start');
    });
    el.addEventListener('compostionend', () => {
      console.log('end');
    });
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
        onKeyDown={(event: any) => {
          console.log('keydown', event.keyCode, event.isComposing);
          if (event.keyCode === 229) {
            this.isDispatch = false;
          }
        }}
        onKeyPress={(event: any) => {
          // IME中だとKeyPressイベントは起きない
          // SafariだとKeyPressは起きない？
          this.isDispatch = true;
          console.log('keypress', event.keyCode, event.isComposing);
        }}
        onKeyUp={(event: any) => {
          console.log('keyup', event.keyCode, event.isComposing);

          // Reset
          this.isDispatch = true;
        }}
      >{value}</div>
    );
  }

  private onInput(event: React.FormEvent<HTMLDivElement>): void {
    console.log((this.isDispatch) ? '内容確定' : '未確定');
    if (this.props.onInput && this.isDispatch) {
      this.props.onInput(event);
    }
  }
}
