'use strict';

require('dot-env');
const express = require('express');
const {config, constants} = require('./config');
const serverHandle = require('./app/server');

const app = express();
serverHandle.use(app);

const {DEVELOPMENT} = config;
if (DEVELOPMENT) {
  const colors = require('colors');
  console.info('DEVELOPMENT'.yellow);
  const morgan = require('morgan');
  app.use(morgan('dev'));
}

if (require.main === module) {
  serverHandle.start()
    .catch( err => {
      console.err(err);
    });
}
module.exports = {
  app,
  startServer: serverHandle.start,
  stopServer: serverHandle.stop
};

