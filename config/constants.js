const config = require('./config');
const colors = require('colors');

module.exports = {
  SERVER_START_SUCCESS: `Server start success. Server is listening on port ${config.PORT}.`.green,
  SERVER_START_ERROR: err => `Server start error. Error: ${err}`.red,
  SERVER_STOPPING: `Server is stopping.`,
  SERVER_STOP_ERROR: err => `Server stop error. Error: ${err}`.red,
  SERVER_DB_CONNECT_ERROR: err => `Database connect error. Error: ${err}`.red,
  SERVER_DB_CONNECT_SUCCESS: db => `Database connect success. Connected to ${db}.`.green
};