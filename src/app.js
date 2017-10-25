/* eslint-disable no-console */

'use strict';

import express from 'express';
import { config, constants } from './config';
import serverHandle from './app/server';
import routes from './routes/';

const app = express();

const { DEVELOPMENT } = config;
if (DEVELOPMENT) {
  const colors = require('colors');
  console.info('DEVELOPMENT'.yellow);
  const morgan = require('morgan');
  app.use(morgan('dev'));
}

const startServer = () => serverHandle.start();
const stopServer = () => serverHandle.stop();

serverHandle.use(app);
app.use(express.static('src/public'));

app.use('/api/user', routes.user);

if (require.main === module) {
  startServer().catch(err => {
    console.error(err.red);
  });
}

export { app, startServer, stopServer };
