'use strict';

import reCAPTCHA from 'recaptcha2';
import format from 'date-fns/format';
import isBefore from 'date-fns/is_before';
import addMinutes from 'date-fns/add_minutes';
import parse from 'date-fns/parse';
import isWithinRange from 'date-fns/is_within_range';
import startOfDay from 'date-fns/start_of_day';
import endOfDay from 'date-fns/end_of_day';
import isEqual from 'date-fns/is_equal';
import settings from '../config';
import models from '../models/';

const { Appointment, HumanValidation, User } = models;
const { constants, config } = settings;
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
      const requiredFields = Appointment.getRequiredForCreate();
      for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
          return res.status(400).json({
            message: constants.MISSING_FIELD(field),
          });
        }
      }
      return HumanValidation.findById(req.body.authorization)
        .then(validation => {
          if (validation) {
            if (!(validation.mobilePhone === req.body.mobilePhone)) {
              return res.status(409).json({
                message: constants.MOBILE_AUTH_MISMATCH,
              });
            }
            return User.findById(req.body.provider)
              .then(user => {
                if (user) {
                  return Appointment.findOne({
                    user_id: req.body.provider,
                    date: startOfDay(req.body.date),
                    time: req.body.time,
                  })
                    .then(existing => {
                      if (!existing) {
                        const data = {
                          user_id: req.body.provider,
                          firstName: req.body.firstName,
                          lastName: req.body.lastName,
                          mobilePhone: req.body.mobilePhone,
                          date: startOfDay(req.body.date),
                          time: req.body.time,
                          authorization: req.body.authorization,
                          confirm: true,
                        };
                        return Appointment.create(data)
                          .then(appt =>
                            res.status(202).json({
                              message: constants.APPOINTMENT_CREATED,
                              ...appt.apiGet(),
                            }),
                          )
                          .catch(error =>
                            res.status(409).json({
                              message: error.message,
                            }),
                          );
                      }
                      return res.status(409).json({
                        message: constants.APPOINTMENT_DATETIME_UNAVAIL,
                      });
                    })
                    .catch(error =>
                      res.status(400).json({
                        message: error.message,
                      }),
                    );
                }
              })
              .catch(() => {
                res.status(409).json({
                  message: constants.PROVIDER_NOT_FOUND,
                });
              });
          }
          return res.status(409).json({
            message: constants.VALIDATION_INVALID,
          });
        })
        .catch(() =>
          res.status(500).json({
            message: constants.INTERNAL_SERVER_ERROR,
          }),
        );
    }
    return res.staus(400).json({
      message: constants.RECAPTCHA_FAILED,
    });
  })
  .catch( () => res.status(400).json({
      message: constants.RECAPTCHA_FAILED
    })
  );
};

const getAppointments = (req, res) => {
  const requiredFields = Appointment.getRequiredForGet();
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.query)) {
      return res.status(400).json({
        message: constants.MISSING_FIELD(field),
      });
    }
  }
  if (req.query.email !== req.user.email) {
    return res.status(400).json({
      message: constants.EMAIL_AUTH_MISMATCH,
    });
  }
  User.findOne({ email: req.query.email })
    .then(user => {
      if (user) {
        if (!user.activated) {
          return res.status(403).json({
            message: constants.USER_ACCOUNT_NOT_ACTIVATED,
          });
        }
        return Appointment.find({
          user_id: user._id,
          date: { $gte: req.query.date },
        }).then(apps => {
          const appointmentsMap = new Map();
          apps.forEach(_app => {
            const date = format(_app.date);
            const mapItem = appointmentsMap.get(date);
            if (mapItem) {
              mapItem.push(_app.apiGet());
            } else {
              appointmentsMap.set(date, []);
              appointmentsMap.get(date).push(_app.apiGet());
            }
          });
          return res.status(200).json(appointmentsMap);
        });
      }
    })
    .catch(err => {
      console.error(err);
      res.status(501).json({
        message: constants.INTERNAL_SERVER_ERROR,
      });
    });
};

const getAvailable = (req, res) => {
  const requiredFields = ['provider', 'date'];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.query)) {
      return res.status(400).json({
        message: constants.MISSING_FIELD(field),
      });
    }
  }
  const requestDate = parse(req.query.date);
  User.findOne({ _id: req.query.provider })
    .then(user => {
      if (user) {
        const day = requestDate.getDay();
        if (!user.workDays[day]) {
          return res.status(200).json({
            message: 'No time slots available.',
          });
        }
        return Appointment.find({
          user_id: user._id,
          date: {
            $gte: startOfDay(requestDate),
            $lte: endOfDay(requestDate),
          },
        }).then(existingAppointments => {
          const availbleTimeSlots = [];
          const startTime = parse(
            `${req.query.date} ${format(
              user.workDayStartTime,
              constants.DISPLAY_TIME_FORMAT,
            )}`,
          );
          const endTime = parse(
            `${req.query.date} ${format(
              user.workDayEndTime,
              constants.DISPLAY_TIME_FORMAT,
            )}`,
          );
          const breakStartTime = parse(
            `${req.query.date} ${format(
              user.workBreakStartTime,
              constants.DISPLAY_TIME_FORMAT,
            )}`,
          );
          for (
            let timeSlot = startTime;
            isBefore(timeSlot, endTime);
            timeSlot = addMinutes(timeSlot, user.appointmentTime)
          ) {
            if (
              !isWithinRange(
                timeSlot,
                breakStartTime,
                addMinutes(breakStartTime, user.workBreakLengthMinutes - 1),
              )
            ) {
              const alreadyTaken = existingAppointments.find(app =>
                isEqual(app.time, timeSlot),
              );
              if (!alreadyTaken) {
                availbleTimeSlots.push(timeSlot);
              }
            }
          }
          return res.status(200).json(availbleTimeSlots);
        });
      }
    })
    .catch(err => {
      console.error(err);
      return res.status(501).json({
        message: constants.INTERNAL_SERVER_ERROR,
      });
    });
};

export default {
  create,
  getAppointments,
  getAvailable,
};
