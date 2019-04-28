import * as path from 'path';
import cluster from 'cluster';
import * as os from 'os';

import * as dotenv from 'dotenv';
import { runServer } from 'server/runServer';

const isProd = process.env.NODE_ENV === 'production';

// If you compile server code with webpack, this is unnecessary.
dotenv.config({
  path: isProd
    ? path.join(__dirname, '..', '..', '..', '.env.prod')
    : path.join(__dirname, '..', '..', '.env.dev')
});

if (isProd) {
  const numCPUs = os.cpus().length;

  if (cluster.isMaster) {
    [...new Array(numCPUs)].forEach(() => cluster.fork());

    // cluster manager
    cluster.on('exit', (worker, code, signal) => {
      console.log(`Restarting ${worker.process.pid}. ${code || signal}`);
      cluster.fork();
    });
  } else {
    runServer();
  }
} else {
  runServer();
}

process.on('uncaughtException', (err) => {
  console.error(err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error(err);
});
