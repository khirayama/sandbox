import * as path from 'path';

import express from 'express';
import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import * as styled from 'styled-components';

import { renderFullPage } from 'server/renderFullPage';
import { SampleComponent } from 'presentations/components/SampleComponent';

export function get(req: express.Request, res: express.Response) {
  const context = {};

  const sheet = new styled.ServerStyleSheet();

  const meta = '';
  const assets = [''];
  const body = ReactDOMServer.renderToString(
    sheet.collectStyles(
      <StaticRouter
        location={req.url}
        context={context}
      >
        <SampleComponent />
      </StaticRouter>
    )
  );
  const style = sheet.getStyleTags();
  const scripts = `<script src="/public/index.bundle.js"></script>`;

  res.send(renderFullPage({
    meta,
    assets,
    body,
    style,
    scripts,
  }));
}
