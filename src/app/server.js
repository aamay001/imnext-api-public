/* eslint-disable no-console */
'use strict';

import mongoose from 'mongoose';
import { config, constants } from '../config';

mongoose.Promise = global.Promise;

let _app;
let _server;

const use = app => {
  _app = app;
};

const start = (database = config.DATABASE_URL) =>
  new Promise((resolve, reject) => {
    mongoose.connect(database, { useMongoClient: true }, err => {
      if (err) {
        console.error(constants.SERVER_DB_CONNECT_ERROR(err));
        return reject(err);
      }
      config.MONGOOSE_DB = mongoose.connections[0].name;
      console.log(
        `${constants.SERVER_DB_CONNECT_SUCCESS(config.MONGOOSE_DB)} @ ${mongoose
          .connection.host}`,
      );
      _server = _app
        .listen(config.PORT, () => {
          console.log(constants.SERVER_START_SUCCESS);
          return resolve(_server);
        })
        .on('error', error => {
          console.log(constants.SERVER_START_ERROR(error));
          mongoose.disconnect();
          return reject(error);
        });
    });
  });

const stop = () =>
  mongoose.disconnect()
    .then(() =>
      new Promise((resolve, reject) => {
      console.log(constants.SERVER_STOPPING);
      _server.close(err => {
        if (err) {
          console.log(constants.SERVER_STOP_ERROR(err));
          return reject(err);
        }
        console.log('Server stopped.');
        return resolve();
      });
    }),
  );

module.exports = {
  start,
  stop,
  use,
};
