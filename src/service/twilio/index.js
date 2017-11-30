/* eslint-disable no-console */
'use strict';

import twilio from 'twilio';
import settings from '../../config';

const config = settings.config;
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
  if(config.DEVELOPMENT) {
    console.info(`Twilio :\nTo: ${to}\nMessage: ${body}`.yellow);
  } else if (config.TEST) {
    console.info('Twilio message send simulated.'.cyan);
  }
  return Promise.resolve({
    sid: 'testok',
  });
}

export default {
  init,
  sendSMS,
};
