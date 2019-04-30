import * as React from 'react';
import { Route, Link } from 'react-router-dom';
import loadable from '@loadable/component';
import * as styled from 'styled-components';

const LoadableHome = loadable((): any => import(/* webpackChunkName: "home" */'presentations/components/Home').then(({ Home }) => Home));
const LoadableAbout = loadable((): any => import(/* webpackChunkName: "about" */'presentations/components/About').then(({ About }) => About));
const LoadableUsers = loadable((): any => import(/* webpackChunkName: "users" */'presentations/components/Users').then(({ Users }) => Users));

const ResetStyle = styled.createGlobalStyle`
html,
body,
section,
header,
footer,
div,
h1,
h2,
h3,
h4,
h5,
h6,
p,
a,
span,
ul,
li,
label,
input,
textarea,
form,
nav,
hr,
code,
select,
button,
table,
thead,
tbody,
tr,
th,
td,
small,
img,
i {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  outline: 0;
  border: 0;
  border-radius: 0;
  font-weight: inherit;
  font-style: normal;
  font-family: inherit;
  vertical-align: baseline;
  -webkit-appearance: none;
}

article,
aside,
details,
figcaption,
figure,
footer,
header,
hgroup,
menu,
nav,
section {
  display: block;
}

a {
  text-decoration: none;
  color: inherit;
}

nav,
ol,
ul {
  list-style: none;
}

table {
  border-collapse: collapse;
  border-spacing: 0;
}

table,
th,
td {
  border: none;
}

img {
  vertical-align: top;
  height: auto;
}

input,
textarea,
button {
  font-size: inherit;
  color: inherit;
}
`;

const GlobalStyle = styled.createGlobalStyle`
  body {
    font-family: sans-serif;
  }
`;

export function SampleComponent() {
  return (
    <>
      <ResetStyle />
      <GlobalStyle />
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/about/">About</Link>
            </li>
            <li>
              <Link to="/users/">Users</Link>
            </li>
          </ul>
        </nav>
        <Route exact path="/" component={LoadableHome} />
        <Route exact path="/about/" component={LoadableAbout} />
        <Route exact path="/users/" component={LoadableUsers} />
      </div>
    </>
  );
}
