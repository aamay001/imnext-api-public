'use strict';

import reCAPTCHA from 'recaptcha2';
import { constants, config } from '../config';
import { Appointment } from '../models/';

const recaptcha = new reCAPTCHA({
  siteKey: config.CAPTCHA_SITE_KEY,
  secretKey: config.CAPTCHA_SECRET,
});

const create = (req, res) => {};

module.exports = {
  create,
};
