/* eslint-disable no-console */

'use strict';

import express from 'express';
import serverHandle from './app/server';
import routes from './routes/';
import auth from './service/authentication';

const app = express();

require('./utility/dev').init(app);

const startServer = () => serverHandle.start();
const stopServer = () => serverHandle.stop();

serverHandle.use(app);
app.use(express.static('src/public'));
auth.init(app);

// ROUTES
app.use('/api/user', routes.user);
app.use('/api/auth', routes.auth);
app.use('/api/is-human/', routes.humanValidation);

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
