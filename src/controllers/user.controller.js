'use strict';

import {User} from '../models/';
import twilio from 'twilio';
import app from '../config';
import reCAPTCHA from 'recaptcha2'

const recapcha = new reCAPTCHA({
  siteKey: app.config.CAPTCHA_SITE_KEY,
  secretKey: app.config.CAPTCHA_SECRET
});

const createUser = (req, res) => {
  //recapcha.validateRequest(req)
    //.then( captchaOk => {
      let captchaOk = true;
      if(captchaOk){
        req.body.email = req.body.email.toLowerCase();
        return User.securePassword(req.body.password)
          .then(secPassword => {
            req.body.password = secPassword;
            return User.create(req.body)
              .then(user => {
                return res.status(201).send(user.apiGet());
              });
          })
          .on('error', err => {
            return res.status(409).send(err);
          });
      }
   // });
}

module.exports = {
  createUser
};
