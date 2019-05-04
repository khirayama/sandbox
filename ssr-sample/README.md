## Stacks

- App
  - [x] express
  - [x] react
  - [x] react-router
  - [x] redux
  - [x] @loadable/component
    - [x] Comparison React.lazy and @loadalbe/component https://www.smooth-code.com/open-source/loadable-components/docs/loadable-vs-react-lazy/
    - [x] ReactDOM.renderToString doesn't support React.lazy. So, we can not do SSR with React.lazy now.
    - [x] @loadable/component needs @loadable/babel-plugin. But it doesn't support typescript.
  - [x] styled-components
  - [x] react-intl
- Dev
  - [x] webpack
  - [x] typescript
  - [x] eslint
  - [x] prettier
- Features
  - [x] Server Side Rendering
  - [x] i18n
  - [ ] Hot Module Replacement

## TODO

- [x] Use http.createServer
- [ ] Watch React.lazy on server side and loadable/component support typescript.

## Rules

- presentations
  - Use routes from `presentations/templates`
    - It is for smooth transition. If you use templates in pages or other layers, you will get blink with dynamic import.
    - templates is like `AppShell`.
  - Use head from `presentations/pages`
  - Not use pages from `containers` and use pages from `routes`

## Refs

- React-Router
  - [Basic - React Router: Declarative Routing for React.js](https://reacttraining.com/react-router/web/example/basic)
  - [Server Rendering - React Router: Declarative Routing for React.js](https://reacttraining.com/react-router/web/guides/server-rendering)
  - [Code Splitting - React Router: Declarative Routing for React.js](https://reacttraining.com/react-router/web/guides/code-splitting)
  - [Redux Integration - React Router: Declarative Routing for React.js](https://reacttraining.com/react-router/web/guides/redux-integration)
- Redux
  - [Getting Started with Redux - Redux](https://redux.js.org/introduction/getting-started)
  - [Usage with React - Redux](https://redux.js.org/basics/usage-with-react)
  - [Usage with React Router - Redux](https://redux.js.org/advanced/usage-with-react-router)
  - [Usage With TypeScript - Redux](https://redux.js.org/recipes/usage-with-typescript)
  - [Server Rendering - Redux](https://redux.js.org/recipes/server-rendering)
- Styled Components
  - [Getting Started - styled-components: Basics](https://www.styled-components.com/docs/basics#getting-started)
  - [Server Side Rendering - styled-components: Advanced Usage](https://www.styled-components.com/docs/advanced#server-side-rendering)
