import config from './config';
import colors from 'colors';

const REGEX = {
  PASSWORD: '/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/',
  PHONE: '/^(+0?1s)?(?d{3})?[s.-]d{3}[s.-]d{4}$/',
  EMAIL: '/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:.[a-zA-Z0-9-]+)*$/',
};

const DATE_FORMAT = 'YYYY-MM-DD';

export default {
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
};
