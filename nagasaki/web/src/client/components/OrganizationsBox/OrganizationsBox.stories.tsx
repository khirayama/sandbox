import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import { OrganizationsBox } from '.';

const stories = storiesOf('components/OrganizationsBox', module);

stories.add('default', () => (
  <div
    style={{
      width: '80%',
      margin: '50px auto',
      background: '#fff'
    }}
  >
    <MemoryRouter initialEntries={['/']}>
      <OrganizationsBox />
    </MemoryRouter>
  </div>
));
