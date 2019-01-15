import * as React from 'react';

import { Document } from 'block-editor/Document';
import { Traverse } from 'block-editor/traverse';

export class App extends React.Component<{}, {}> {
  public render(): JSX.Element {
    const traverse: Traverse = new Traverse();

    return (
      <div>
        <Document doc={traverse.getNode()} />
      </div>
    );
  }
}
