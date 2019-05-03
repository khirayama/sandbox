import express from 'express';

import * as renderer from 'server/renderer';

const app: express.Application = express();

const PORT = process.env.PORT || 3000;

app.use('/public', express.static('dist/public'));
app.get('*', renderer.get);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Start app listening at ${PORT}.`);
});
