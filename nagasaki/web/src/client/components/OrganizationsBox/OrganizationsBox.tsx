import * as React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

interface State {
  currentValue: string;
}

const Ul = styled.ul`
  box-shadow: 0px 0px 5px silver;
  margin: auto;
  max-width: 600px;
  padding: 0.5em 0.5em 0.5em 2em;
  width: 90%;
`;

const Li = styled.li`
  line-height: 1.5;
  padding: 0.5em 0;
`;

const A = styled(Link)`
  color: #333;
  text-decoration: none;
`;

const InputBox = styled(Li)`
  display: flex;
  justify-content: flex-end;
`;

export class OrganizationsBox extends React.PureComponent<unknown, State> {
  state = { currentValue: '' };

  onChange = (e: React.FormEvent<HTMLInputElement>) => {
    this.setState({ currentValue: e.currentTarget.value });
  };

  render() {
    return (
      <React.Fragment>
        {({ loading, error, data }: any) => (
          <Ul>
            {error || loading ? <p>{error ? `Error! ${error.message}` : 'loading...'}</p> : null}
            {data &&
              data.organizations &&
              data.organizations.map(({ name, uid }: any) => (
                <Li key={uid}>
                  <A to={`/orgs/${name}`}>{name}</A>
                </Li>
              ))}
            <React.Fragment>
              {error && <p>{`Error! ${error.message}`}</p>}
              <InputBox>
                <input onChange={this.onChange} value={this.state.currentValue} />
                <button onClick={() => console.log('submit')}>Add</button>
              </InputBox>
            </React.Fragment>
          </Ul>
        )}
      </React.Fragment>
    );
  }
}
