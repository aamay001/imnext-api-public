'use strict';

import twilio from 'twilio';
import reCAPTCHA from 'recaptcha2'
import mongoose from 'mongoose';
import {constants, config} from '../config';
import {User} from '../models/';

const recaptcha = new reCAPTCHA({
  siteKey: config.CAPTCHA_SITE_KEY,
  secretKey: config.CAPTCHA_SECRET
});

const createUser = (req, res) => {
  // recaptcha.validateRequest(req)
    // .then( captchaOk => {
      const captchaOk = true;
      if(captchaOk){
        const body = req.body;
        body.email = req.body.email.toLowerCase();
        User.create(body)
          .then(user => res.status(201).json(
            {
              message: constants.USER_CREATE_SUCCESS,
              ok: true
            }))
          .catch(error => res.status(500).json(error));
      }
   // });
}

const putSettings = (req, res) => {
  const requiredFields = User.getRequiredForSettings();
  for ( let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const response = {
        message: `Missing ${field} in request body.`,
        ok: false
      };
      return res.status(400).json(response);
    }
  }
  if(req.body.email !== req.user.email) {
    const response = {
      message: `User id does not match authentication.`,
      ok: false
    };
    return res.status(409).json(response);
  }
  User.findOne({email: req.body.email})
    .then( user =>
      User.findOneAndUpdate({_id: user._id}, req.body)
        .then( updatedUser => res.status(202).json(updatedUser.apiGetWorkSettings()))
    )
    .catch(error => res.status(409).json(error));
}

module.exports = {
  createUser,
  putSettings
};
