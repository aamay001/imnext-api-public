'use strict';

import twilio from 'twilio';
import { config } from '../../config';

const { TWILIO_ACCOUNT, TWILIO_TOKEN, TWILIO_NUMBER } = config;
let client;

function init() {
  if (!client) {
    client = new twilio(TWILIO_ACCOUNT, TWILIO_TOKEN);
  }
}

function sendSMS(body, to) {
  if (config.PRODUCTION) {
    return client.messages.create({
      body,
      to, // Text this number
      from: TWILIO_NUMBER, // From a valid Twilio number
    });
  }
  console.info('Twilio sendSMS() dev stub.'.yellow);
  return Promise.resolve({
    sid: 'testok',
  });
}

module.exports = {
  init,
  sendSMS,
};
