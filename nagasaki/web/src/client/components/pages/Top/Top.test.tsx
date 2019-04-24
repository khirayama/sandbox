import * as React from 'react';
import { shallow, mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import { MemoryRouter } from 'react-router-dom';
import { Top } from '.';

const mockedData = {
  organizations: [
    {
      uid: 1,
      name: 'name',
      uri: 'uri'
    },
    {
      uid: 2,
      name: 'name2',
      uri: 'uri'
    },
    {
      uid: 3,
      name: 'name3',
      uri: 'uri'
    },
    {
      uid: 4,
      name: 'name4',
      uri: 'uri'
    }
  ]
};

test('should render self and sub-components', () => {
  const tree = shallow(
    <MemoryRouter initialEntries={[{ pathname: '/', key: 'testKey' }]}>
      <Top error={null} load={() => {}} />
    </MemoryRouter>
  );

  expect(toJson(tree)).toMatchSnapshot();
});

test('should call load', () => {
  const load = jest.fn();

  mount(
    <MemoryRouter initialEntries={[{ pathname: '/', key: 'testKey' }]}>
      <Top error={null} load={load} />
    </MemoryRouter>
  );

  expect(load).toHaveBeenCalled();
});
