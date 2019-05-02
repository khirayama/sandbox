import * as path from 'path';

import express from 'express';
import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import * as styled from 'styled-components';
import ReactHelmet from 'react-helmet';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

import { reducer } from 'client/reducers';
import { renderFullPage } from 'server/renderFullPage';
import { Sample } from 'client/components/SampleComponent';

export function get(req: express.Request, res: express.Response) {
  const context = {};
  const store = createStore(reducer);

  const sheet = new styled.ServerStyleSheet();

  const assets = [''];
  const body = ReactDOMServer.renderToString(
    sheet.collectStyles(
      <Provider store={store}>
        <StaticRouter
          location={req.url}
          context={context}
        >
          <Sample />
        </StaticRouter>
      </Provider>
    )
  );
  const preloadedState = store.getState();
  const helmetContent = ReactHelmet.renderStatic();
  const meta = `
      ${helmetContent.meta.toString()}
      ${helmetContent.title.toString()}
      ${helmetContent.link.toString()}
    `.trim();
  const style = sheet.getStyleTags();
  const scripts = `<script src="/public/index.bundle.js"></script>`;

  res.send(renderFullPage({
    meta,
    assets,
    body,
    style,
    scripts,
    preloadedState: JSON.stringify(preloadedState),
  }));
}
