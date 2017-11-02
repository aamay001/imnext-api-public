import settings from '../config';

const { DEVELOPMENT } = settings.config;
const init = app => {
  if (DEVELOPMENT) {
    const colors = require('colors');
    console.info('DEVELOPMENT'.yellow);
    const morgan = require('morgan');
    app.use(morgan('dev'));
    console.log(`SITE KEY: ${settings.config.CAPTCHA_SITE_KEY}`);
    console.log(`SECRET KEY: ${settings.config.CAPTCHA_SECRET}`);
  }
};

module.exports = {
  init,
  DEVELOPMENT,
};
