/* eslint-disable no-console */

'use strict';

import express from 'express';
import { config, constants } from './config';
import serverHandle from './app/server';

const startServer = () => serverHandle.start();
const stopServer = () => serverHandle.stop();

const app = express();
serverHandle.use(app);
app.use(express.static('src/public'));

const { DEVELOPMENT } = config;
if (DEVELOPMENT) {
  const colors = require('colors');
  console.info('DEVELOPMENT'.yellow);
  require('dot-env');
  const morgan = require('morgan');
  app.use(morgan('dev'));
}

if (require.main === module) {
  startServer().catch(err => {
    console.error(err.red);
  });
}

export { app, startServer, stopServer };
