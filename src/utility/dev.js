import { config } from '../config';

const { DEVELOPMENT } = config;
const init = app => {
  if (DEVELOPMENT) {
    const colors = require('colors');
    console.info('DEVELOPMENT'.yellow);
    const morgan = require('morgan');
    app.use(morgan('dev'));
  }
};

module.exports = {
  init,
  DEVELOPMENT,
};
