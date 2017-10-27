'use strict';

import reCAPTCHA from 'recaptcha2';
import { constants, config } from '../config';
import { User, HumanValidation } from '../models/';
import twilio from '../service/twilio';

twilio.init();

const recaptcha = new reCAPTCHA({
  siteKey: config.CAPTCHA_SITE_KEY,
  secretKey: config.CAPTCHA_SECRET,
});

const create = (req, res) => {
  (config.PRODUCTION
    ? recaptcha.validateRequest(req)
    : new Promise(resolve => resolve(true))
  ).then(captchaOk => {
    if (captchaOk) {
      const requiredFields = User.getRequiredForCreate();
      for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
          const response = {
            message: `Missing ${field} in request body.`,
            ok: false,
          };
          return res.status(400).json(response);
        }
      }
      const body = req.body;
      body.email = req.body.email.toLowerCase();
      User.create(body)
        .then(newUser => {
          console.info(`User account created: ${req.body.email}`.cyan);
          const humanValidation = {
            firstName: body.firstName,
            lastName: body.lastName,
            mobilePhone: body.mobilePhone,
            type: 'ACTIVATION',
            activationId: newUser._id.toString(),
          };
          return HumanValidation.create(humanValidation).then( hV => twilio.sendSMS(
              `imNext Account Activation Code: ${hV.validationCode}\nExpired in 30 minutes.`,
              humanValidation.mobilePhone
            )
            .then(() =>
              res.status(201).json({
                message: constants.USER_CREATE_SUCCESS,
                ok: true,
              })
            ));
        })
        .catch(error => res.status(400).json(error));
    } else {
      return res.status(400).json({
        message: 'reCAPTCHA validation failed.',
        ok: false,
      });
    }
  });
};

const updateSettings = (req, res) => {
  if (req.body.email !== req.user.email) {
    const response = {
      message: `User id does not match authentication.`,
      ok: false,
    };
    return res.status(409).json(response);
  }
  const requiredFields = User.getRequiredForSettings();
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const response = {
        message: `Missing ${field} in request body.`,
        ok: false,
      };
      return res.status(400).json(response);
    }
  }
  User.findOne({ email: req.body.email })
    .then(user => {
      if(user) {
        if (!user.activated) {
          return res.status(403).json({
            message: "User account is not activated",
            ok: false
          });
        }
        const updateData = {
          workHoursPerDay: req.body.workHoursPerDay,
          workDays: req.body.workDays,
          workDayStartTime: req.body.workDayStartTime,
          workDayEndTime: req.body.workDayEndTime,
          workBreakStartTime: req.body.workBreakStartTime,
          workBreakLengthMinutes: req.body.workBreakLengthMinutes,
          providerName: req.body.providerName,
        };
        User.findByIdAndUpdate({ _id: user._id }, updateData, {
          upsert: false,
          new: true,
        }).then(updatedUser => {
          console.info(`User settings updated: ${updatedUser.email}`.cyan);
          return res.status(202).json(updatedUser.apiGetWorkSettings());
        });
      } else {
        return res.status(404).json({
          message: "User not found.",
          ok: false
        });
      }
    })
    .catch(error => res.status(409).json(error));
};

module.exports = {
  create,
  updateSettings,
};
