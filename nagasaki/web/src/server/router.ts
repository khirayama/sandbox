import * as express from 'express';

import * as renderer from 'server/controllers/renderer';

export function router(app: express.Application) {
  app.use('/favicon.ico', (req, res) => res.status(200).send());
  app.use('/public', express.static('dist/client'));
  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
  app.get('*', renderer.get);
}
