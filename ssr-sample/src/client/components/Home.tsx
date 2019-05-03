import * as React from 'react';
import * as styled from 'styled-components';
import { injectIntl } from 'react-intl';

import { Head } from 'client/components/Head';
import { Navigation } from 'client/components/Navigation';
import { Counter } from 'client/containers/Counter';

const Wrapper = styled.default.div`
  color: blue;
`;

export const Home = injectIntl(function(props) {
  const title: string = props.intl.formatMessage({ id: 'Home.Title' });
  const description: string = props.intl.formatMessage({ id: 'Home.Description' });

  return (
    <>
      <Head title={title} description={description} />
      <Navigation />
      <Wrapper>
        <h2>Home</h2>
        <Counter />
      </Wrapper>
    </>
  );
});
