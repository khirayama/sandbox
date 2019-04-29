import express from 'express';
import * as ReactDOMServer from 'react-dom/server';

import { SampleComponent } from 'presentations/components/SampleComponent';

const app: express.Application = express();

const PORT = process.env.PORT || 3000;

interface Params {
  meta: string;
  assets: Array<string>;
  body: string;
  style: string;
  scripts: string;
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
  scripts,
}: Params) => {
  return `<!DOCTYPE html>
    <html>
      <head>
        ${meta}
        ${style}
      </head>
      <body>
        <div id="root">
          ${body}
        </div>
        ${scripts}
        ${assets.map((asset) => `<script src=${asset}></script>`).join('\n')}
      </body>
    </html>
  `.trim();
};

app.get('*', (req, res) => {
  const meta = '';
  const assets = [''];
  const body = ReactDOMServer.renderToString(SampleComponent());
  const style = '<style>* { background: gray; }</style>';
  const scripts = `<script></script>`;

  res.send(renderFullPage({
    meta,
    assets,
    body,
    style,
    scripts,
  }));
});

app.listen(PORT, () => {
  console.log(`Start app listening at ${PORT}.`);
});
