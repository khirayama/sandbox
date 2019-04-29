import * as React from 'react';
import { createGlobalStyle } from 'styled-components';

import { Main } from 'client/components/Main';

const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'Muli', sans-serif;
    margin: 0;
  }
`;

export type Props = {
  load: () => void;
};

// like App-Shell of PWA
export class App extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);

    props.load();
  }

  render() {
    return (
      <Main>
        <GlobalStyle />
        {this.props.children}
      </Main>
    );
  }
}
