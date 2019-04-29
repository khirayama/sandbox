import * as path from 'path';

import express from 'express';
import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { ChunkExtractor } from '@loadable/server';

import { renderFullPage } from 'server/renderFullPage';
import { SampleComponent } from 'presentations/components/SampleComponent';

const statsFile = path.resolve('dist', 'loadable-stats.json');
const extractor = new ChunkExtractor({ statsFile });

export function get(req: express.Request, res: express.Response) {
  const context = {};

  const meta = '';
  const assets = [''];
  const body = ReactDOMServer.renderToString(
    extractor.collectChunks(
      <StaticRouter
        location={req.url}
        context={context}
      >
        <SampleComponent />
      </StaticRouter>
    )
  );
  const style = '<style>* { background: gray; }</style>';
  const scripts = `<script src="/public/index.bundle.js"></script>`;

  res.send(renderFullPage({
    meta,
    assets,
    body,
    style,
    scripts,
  }));
}
