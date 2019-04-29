import express from 'express';
import * as ReactDOMServer from 'react-dom/server';

import { renderFullPage } from 'server/renderFullPage';
import { SampleComponent } from 'presentations/components/SampleComponent';

const app: express.Application = express();

const PORT = process.env.PORT || 3000;

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
