'use strict';

import reCAPTCHA from 'recaptcha2';
import differenceInMinutes from 'date-fns/difference_in_minutes';
import { constants, config } from '../config';
import { HumanValidation, User} from '../models/';
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
      const requiredFields = HumanValidation.getRequiredForCreate();
      for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
          const message = {
            ok: false,
            message: `Missing ${field} in request body.`,
          };
          return res.status(400).json(message);
        }
      }
      const data = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        mobilePhone: req.body.mobilePhone,
      };
      return HumanValidation.findOne({mobilePhone: data.mobilePhone, complete: false})
        .then( existing => {
          if ( !existing || (existing && differenceInMinutes(new Date(), existing.expiration) > 25) ) {
            return HumanValidation.create(data)
              .then(hV => {
                twilio
                  .sendSMS(
                    `imNext Appointment Validation Code: ${hV.validationCode}\nExpires in 30 minutes.`,
                    data.mobilePhone,
                  )
                  .then(() =>
                    res.status(202).json({
                      ok: true,
                      message: 'Human validation created.',
                    }),
                  );
              })
              .catch(err => res.status(500).json(err));
          }
          return res.status(429).json({
            message: "Validations can only be generated every 25 minutes for same mobile. Use existing validation code first.",
            ok: true
          });
        })
    }
    return res.status(400).json({
      message: 'reCAPTCHA validation failed.',
      ok: false,
    });
  });
};

const activate = (req, res) => {
  if(req.body.mobilePhone !== req.user.mobilePhone) {
    const response = {
      message: `Mobile phone does not match authentication.`,
      ok: false,
    };
    return res.status(409).json(response);
  }
};

const validate = (req, res) => {

}

module.exports = {
  create,
  activate,
  validate,
};
