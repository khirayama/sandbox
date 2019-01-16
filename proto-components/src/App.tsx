import * as React from 'react';
import * as uuid from 'uuid/v4';

import { doc } from 'block-editor/doc';
import { Document } from 'block-editor/Document';

export class App extends React.Component<{}, {}> {
  public render(): JSX.Element {

    return (
      <div>
        <Document doc={doc} />
      </div>
    );
  }
}
