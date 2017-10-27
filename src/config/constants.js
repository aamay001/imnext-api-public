import config from './config';
import colors from 'colors';

const REGEX = {
  PASSWORD: new RegExp(
    /^(?:(?=.*[a-z])(?:(?=.*[A-Z])(?=.*[\d\W])|(?=.*\W)(?=.*\d))|(?=.*\W)(?=.*[A-Z])(?=.*\d)).{8,}$/,
  ),
  PHONE: new RegExp(
    /^(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?$/,
  ),
  EMAIL: new RegExp(
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  ),
};

const DATE_FORMAT = 'YYYY-MM-DD';

module.exports = {
  REGEX,
  DATE_FORMAT,
  SERVER_START_SUCCESS: `Server start success. Server is listening on port ${config.PORT}.`
    .green,
  SERVER_START_ERROR: err => `Server start error. Error: ${err}`.red,
  SERVER_STOPPING: `Server is stopping.`,
  SERVER_STOP_ERROR: err => `Server stop error. Error: ${err}`.red,
  SERVER_DB_CONNECT_ERROR: err => `Database connect error. Error: ${err}`.red,
  SERVER_DB_CONNECT_SUCCESS: db =>
    `Database connect success. Connected to ${db}.`.green,
  USER_CREATE_SUCCESS: 'User account created',
};
