/* eslint-disable no-console */
'use strict';

import reCAPTCHA from 'recaptcha2';
import addMinutes from 'date-fns/add_minutes';
import settings from '../config';
import models from '../models/';
import twilio from '../service/twilio';

const User = models.User;
const HumanValidation = models.HumanValidation;
const { constants, config } = settings;

twilio.init();

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
        const requiredFields = User.getRequiredForCreate();
        for (let i = 0; i < requiredFields.length; i++) {
          const field = requiredFields[i];
          if (!(field in req.body)) {
            return res.status(400).json({
              message: constants.MISSING_FIELD(field),
            });
          }
        }
        const body = req.body;
        body.created = new Date();
        body.providerName = `${body.firstName} ${body.lastName}`;
        body.email = req.body.email.toLowerCase();
        User.create(body)
          .then(newUser => {
            console.info(`User account created: ${req.body.email}`.cyan);
            const humanValidation = {
              firstName: body.firstName,
              lastName: body.lastName,
              mobilePhone: body.mobilePhone,
              type: 'ACTIVATION',
              validationCode: Math.floor(
                Math.random() * (99999999 - 10000000 + 1) + 10000000,
              ),
              activationId: newUser._id.toString(),
              created: new Date(),
              expiration: addMinutes(new Date(), 30),
            };
            return HumanValidation.create(humanValidation).then(hV =>
              twilio
                .sendSMS(
                  constants.ACCOUNT_ACTIVATION_SMS(hV.validationCode),
                  humanValidation.mobilePhone,
                )
                .then(() =>
                  res.status(201).json({
                    message: constants.USER_CREATE_SUCCESS,
                  }),
                ),
            );
          })
          .catch(error =>
            res.status(400).json({
              message: error.message,
            }),
          );
      } else {
        return res.status(400).json({
          message: constants.RECAPTCHA_FAILED,
        });
      }
    })
    .catch(() =>
      res.status(400).json({
        message: constants.RECAPTCHA_FAILED,
      }),
    );
};

const get = (req, res) => {
  User.findOne({ email: req.user.email })
    .then(user => {
      if (user) {
        return res.status(200).json(user.apiGet());
      }
      return res.status(404).json({
        message: constants.USER_NOT_FOUND,
      });
    })
    .catch(error => {
      console.error(error.red);
      return res.send(500).json({
        message: constants.INTERNAL_SERVER_ERROR,
      });
    });
};

const updateSettings = (req, res) => {
  const requiredFields = User.getRequiredForSettings();
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
  User.findOne({ email: req.body.email })
    .then(user => {
      if (user) {
        if (!user.activated) {
          return res.status(403).json({
            message: constants.USER_ACCOUNT_NOT_ACTIVATED,
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
          return res.status(202).json(updatedUser.apiGet());
        });
      } else {
        return res.status(404).json({
          message: constants.USER_NOT_FOUND,
        });
      }
    })
    .catch(error => res.status(409).json(error));
};

const getProviders = (req, res) => {
  User.find({ activated: true }).then(users => {
    const providers = users.map(u => u.apiGetProvider());
    return res.status(200).json(providers);
  });
};

export default {
  create,
  get,
  getProviders,
  updateSettings,
};
