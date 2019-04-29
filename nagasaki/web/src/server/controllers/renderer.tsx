import { Request, Response } from 'express';
import * as React from 'react';
import { Provider } from 'react-redux';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import Helmet from 'react-helmet';
import { ServerStyleSheet } from 'styled-components';

import { Router } from 'client/Router/Router';
import { configureStore } from 'client/store/configureStore';

interface Params {
  meta: string;
  assets: Array<string>;
  body: string;
  style: string;
  preloadedState: string;
  scripts: string;
  nonce: string;
}

const escape = (str: string) => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

export const renderFullPage = ({
  meta,
  assets,
  body,
  style,
  preloadedState,
  scripts,
  nonce
}: Params) => {
  return `<!DOCTYPE html>
    <html>
      <head>
        <meta property="csp-nonce" content="${nonce}">
        ${meta}
        ${style}
      </head>
      <body>
        ${body}
        <script nonce="${nonce}" id="initial-data" type="text/plain" data-json="${escape(preloadedState)}"></script>
        ${scripts}
        ${assets.map((asset) => `<script nonce="${nonce}" src=${asset}></script>`).join('\n')}
      </body>
    </html>
  `.trim();
};

const fileName = 'main';
const main = new RegExp(`^${fileName}~.*\.js$`);
const vendor = new RegExp(`^vendor~${fileName}~.*\.js$`);

// You need to reboot this server if you change client javascript files.
// You need to read the manifest in `get` method if you do not want to restart.
const assets =
  process.env.NODE_ENV === 'production'
    ? (() => {
        const manifest: {
          [key: string]: string;
        } = require('client/manifest');

        const entryPoints = [manifest['manifest.js']];

        for (const [key, value] of Object.entries(manifest)) {
          if (main.test(key) || vendor.test(key)) entryPoints.push(value);
        }

        return entryPoints;
      })()
    : [`/public/${fileName}.bundle.js`];

export async function get(req: Request, res: Response) {
  const { nonce }: { nonce: string } = res.locals;
  const store = configureStore();
  const sheet = new ServerStyleSheet();

  console.log(req.url);
  const App = (
    <Provider store={store}>
      <StaticRouter location={req.url} context={{}}>
        <div id="root">
          <Router />
        </div>
      </StaticRouter>
    </Provider>
  );

  try {
    const preloadedState = JSON.stringify(store.getState());
    const helmetContent = Helmet.renderStatic();
    const meta = `
      ${helmetContent.meta.toString()}
      ${helmetContent.title.toString()}
      ${helmetContent.link.toString()}
    `.trim();
    const style = sheet.getStyleTags();
    const body = renderToString(App);
    const scripts = '';

    res.send(
      renderFullPage({ meta, assets, body, style, preloadedState, scripts, nonce })
    );
  } catch (e) {
    res.status(500).send(e.message);
  }
}
