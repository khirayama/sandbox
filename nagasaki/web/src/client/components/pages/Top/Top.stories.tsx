import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import { Top } from '.';

const stories = storiesOf('components/pages/Top', module);

const mockedAuthor = {
  author: {
    name: 'hiroppy',
    blog: 'https://hiroppy.me',
    avatar_url: 'https://avatars0.githubusercontent.com/u/3367801?s=400&v=4'
  }
};

stories.add('default', () => (
  <div
    style={{
      width: '80%',
      margin: '50px auto',
      background: '#fff'
    }}
  >
    <MemoryRouter initialEntries={['/']}>
      <Top error={null} load={() => {}} />
    </MemoryRouter>
  </div>
));
