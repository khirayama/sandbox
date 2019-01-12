import * as React from 'react';

import { ContentEditableText } from 'block-editor/ContentEditableText';

export class App extends React.Component<{}, { value: string }> {
  constructor(props: {}) {
    super(props);

    this.state = {
      value: 'value',
    };

    // setInterval(() => {
    //   this.setState({
    //     value: '000' + this.state.value + '111',
    //   });
    // }, 2000);
  }

  public render(): JSX.Element {
    return (
      <div>
        <ContentEditableText value={this.state.value} onInput={(event: React.FormEvent<HTMLElement>) => {
          const value: string = event.currentTarget.innerText;
          // console.log(value);
          this.setState({ value });
        }} />
      </div>
    );
  }
}
