/* eslint-disable no-console */
'use strict';

import reCAPTCHA from 'recaptcha2';
import settings from '../config';
import models from '../models/';
import twilio from '../service/twilio';

twilio.init();

const { constants, config } = settings;
const { HumanValidation, User } = models;
const recaptcha = new reCAPTCHA({
  siteKey: config.CAPTCHA_SITE_KEY,
  secretKey: config.CAPTCHA_SECRET,
});

const create = (req, res) => {
  (config.PRODUCTION
    ? recaptcha.validateRequest(req)
    : new Promise(resolve => resolve(true))
  )
    .then(captchaOk => {
      if (captchaOk) {
        const requiredFields = HumanValidation.getRequiredForCreate();
        for (let i = 0; i < requiredFields.length; i++) {
          const field = requiredFields[i];
          if (!(field in req.body)) {
            return res.status(400).json({
              message: constants.MISSING_FIELD(field),
            });
          }
        }
        const data = {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          mobilePhone: req.body.mobilePhone,
          validationCode: Math.floor(
            Math.random() * (99999999 - 10000000 + 1) + 10000000,
          ),
        };
        const now = new Date();
        return HumanValidation.findOne({
          mobilePhone: data.mobilePhone,
          complete: false,
          expiration: { $gt: now },
          type: 'APPOINTMENT',
        }).then(existing => {
          if (!existing) {
            return HumanValidation.create(data)
              .then(hV => {
                twilio
                  .sendSMS(
                    constants.APPOINTMENT_VALIDATION_SMS(hV.validationCode),
                    hV.mobilePhone,
                  )
                  .then(() =>
                    res.status(201).json({
                      message: constants.VALIDATION_CREATED,
                    }),
                  );
              })
              .catch(err => res.status(500).json(err));
          }
          return res.status(429).json({
            message: constants.VALIDATION_EXISTS,
          });
        });
      }
      return res.status(400).json({
        message: constants.RECAPTCHA_FAILED,
      });
    })
    .catch(() =>
      res.status(400).json({
        message: constants.RECAPTCHA_FAILED,
      }),
    );
};

const activate = (req, res) => {
  const requiredFields = HumanValidation.getRequiredForActivation();
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      return res.status(400).json({
        message: constants.MISSING_FIELD(field),
      });
    }
  }
  if (req.body.email !== req.user.email) {
    return res.status(400).json({
      message: constants.EMAIL_AUTH_MISMATCH,
    });
  }
  if (req.body.mobilePhone !== req.user.mobilePhone) {
    return res.status(400).json({
      message: constants.MOBILE_AUTH_MISMATCH,
    });
  }
  const now = new Date();
  return HumanValidation.findOneAndUpdate(
    {
      mobilePhone: req.body.mobilePhone,
      complete: false,
      validationCode: req.body.validationCode,
      expiration: { $gt: now },
      type: 'ACTIVATION',
    },
    {
      complete: true,
      completedOn: now,
    },
    {
      upsert: false,
      new: true,
    },
  )
    .then(validation => {
      if (validation) {
        return User.findOneAndUpdate(
          { email: req.body.email },
          { activated: true },
          {
            upsert: false,
            new: true,
          },
        ).then(updatedUser => {
          console.info(`User account activated: ${updatedUser.email}`.cyan);
          return res.status(202).json({
            message: constants.ACCOUNT_ACTIVATED,
          });
        });
      }
      return res.status(200).json({
        message: constants.ACCOUNT_ACTIVATION_FAILED,
      });
    })
    .catch(() =>
      res.status(400).json({
        messaga: constants.VALIDATION_INVALID,
      }),
    );
};

const validate = (req, res) => {
  const requiredFields = HumanValidation.getRequiredForValidation();
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      return res.status(400).json({
        message: constants.MISSING_FIELD(field),
      });
    }
  }
  const now = new Date();
  return HumanValidation.findOneAndUpdate(
    {
      mobilePhone: req.body.mobilePhone,
      complete: false,
      validationCode: parseInt(req.body.validationCode, 10),
      expiration: { $gte: now },
      type: 'APPOINTMENT',
    },
    {
      complete: true,
      completedOn: now,
    },
    {
      upsert: false,
      new: true,
    },
  )
    .then(validation => {
      if (validation) {
        return res.status(202).json({
          message: constants.VALIDATION_SUCCESS,
          authorization: validation._id,
        });
      }
      console.log(validation);
      return res.status(409).json({
        message: constants.VALIDATION_FAILED,
      });
    })
    .catch(() =>
      res.status(500).json({
        messaga: constants.INTERNAL_SERVER_ERROR,
      }),
    );
};

export default {
  create,
  activate,
  validate,
};
