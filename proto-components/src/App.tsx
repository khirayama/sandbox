import * as React from 'react';

import { Pad } from 'block-editor/Pad';
export class App extends React.Component<{}, {}> {
  public render(): JSX.Element {
    return (
      <div>
        <Pad />
      </div>
    );
  }
}
