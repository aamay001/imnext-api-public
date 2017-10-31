import settings from '../config';

const { DEVELOPMENT } = settings.config;
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
