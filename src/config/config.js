/* eslint-disable no-console */
'use strict';

const PORT = process.env.PORT || 8080;
const DATABASE_NAME = 'im-next';
const DATABASE_URL =
  process.env.DATABASE_URL || `mongodb://localhost/${DATABASE_NAME}`;
const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL || `mongodb://localhost/test-${DATABASE_NAME}`;
const TOKEN_SECRET = process.env.TOKEN_SECRET;
const TOKEN_EXP = process.env.TOKEN_EXP || '7d';
const DEVELOPMENT = process.env.NODE_ENV === 'dev';
const PRODUCTION = process.env.NODE_ENV === 'prod';
const TWILIO_ACCOUNT = process.env.TWILIO_ACCOUNT;
const TWILIO_TOKEN = process.env.TWILIO_TOKEN;
const TWILIO_NUMBER = process.env.TWILIO_NUMBER;
const TEST_CONFIRM_NUMBER = process.env.TEST_CONFIRM_NUMBER;
const CAPTCHA_SITE_KEY = process.env.CAPTCHA_SITE_KEY;
const CAPTCHA_SECRET = process.env.CAPTCHA_SECRET;
let MONGOOSE_DB;

console.log(
  `NODE ENV: ${DEVELOPMENT
    ? 'DEVELOPMENT'
    : PRODUCTION ? 'PRODUCTION' : 'OTHER'}`,
);
console.log(`BABEL ENV: ${process.env.BABEL_ENV.toUpperCase()}`);

module.exports = {
  PORT,
  DATABASE_NAME,
  DATABASE_URL,
  TEST_DATABASE_URL,
  TOKEN_SECRET,
  TOKEN_EXP,
  DEVELOPMENT,
  PRODUCTION,
  TWILIO_ACCOUNT,
  TWILIO_TOKEN,
  TWILIO_NUMBER,
  TEST_CONFIRM_NUMBER,
  CAPTCHA_SECRET,
  CAPTCHA_SITE_KEY,
  MONGOOSE_DB,
};
