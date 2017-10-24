'use strict';

const { config, constants } = require('../config');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var _app;
var _server;

const use = app => {
  _app = app;
};

const start = (database = config.DATABASE_URL) => {
  return new Promise((resolve, reject) => {
    mongoose.connect(database, { useMongoClient: true }, err => {
      if (err) {
        console.error(constants.SERVER_DB_CONNECT_ERROR(err));
        return reject(err);
      }
      config.MONGOOSE_DB = mongoose.connections[0].name;
      console.log(constants.SERVER_DB_CONNECT_SUCCESS(config.MONGOOSE_DB));
      _server = _app
        .listen(config.PORT, () => {
          console.log(constants.SERVER_START_SUCCESS);
          return resolve(_server);
        })
        .on('error', err => {
          console.log(constants.SERVER_START_ERROR(err));
          mongoose.disconnect();
          return reject(err);
        });
    });
  });
};

const stop = () => {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log(constants.SERVER_STOPPING);
      _server.close(err => {
        if (err) {
          console.log(constants.SERVER_STOP_ERROR(err));
          return reject(err);
        }
        return resolve();
      });
    });
  });
};

module.exports = {
  start,
  stop,
  use,
};
