import * as express from 'express';

const app: express.Application = express();

const PORT = process.env.PORT || 3000;

app.get('*', (req, res) => {
  res.send('Hi');
});

app.listen(PORT, () => {
  console.log(`Start app listening at ${PORT}.`);
});
