/* eslint-disable no-console */

'use strict';

import express from 'express';
import cors from 'cors';
import serverHandle from './app/server';
import routes from './routes/';
import auth from './service/authentication';
import settings from './config';

const app = express();
app.use(
  cors({
    origin: settings.config.CLIENT_ORIGIN,
  }),
);

require('./utility/dev').init(app);

const startServer = () => serverHandle.start();
const stopServer = () => serverHandle.stop();

serverHandle.use(app);
app.use(express.static('src/public'));
auth.init(app);

// ROUTES
app.use('/user', routes.user);
app.use('/auth', routes.auth);
app.use('/is-human', routes.humanValidation);
app.use('/appointment', routes.appointment);
app.use('/provider', routes.provider);

if (require.main === module) {
  startServer().catch(err => {
    console.error(err.red);
  });
}

module.exports = {
  app,
  startServer,
  stopServer,
};
