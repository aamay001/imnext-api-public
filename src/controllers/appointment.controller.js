'use strict';

import format from 'date-fns/format';
import isBefore from 'date-fns/is_before';
import addMinutes from 'date-fns/add_minutes';
import addHours from 'date-fns/add_hours';
import parse from 'date-fns/parse';
import { isAfter } from 'date-fns';
import isWithinRange from 'date-fns/is_within_range';
import startOfDay from 'date-fns/start_of_day';
import endOfDay from 'date-fns/end_of_day';
import isEqual from 'date-fns/is_equal';
import settings from '../config';
import models from '../models/';
import twilio from '../service/twilio';

twilio.init();

const { Appointment, HumanValidation, User } = models;
const { constants } = settings;

const create = (req, res) => {
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
        return User.findById(req.body.providerId)
          .then(user => {
            const appTime = parse(`${req.body.date}, ${req.body.time}`);
            if (user) {
              return Appointment.findOne({
                user_id: req.body.providerId,
                date: startOfDay(req.body.date),
                time: appTime,
              })
                .then(existing => {
                  if (!existing && user.workDays[appTime.getDay()]) {
                    const data = {
                      user_id: req.body.providerId,
                      firstName: req.body.firstName,
                      lastName: req.body.lastName,
                      mobilePhone: req.body.mobilePhone,
                      date: startOfDay(req.body.date),
                      time: appTime,
                      authorization: req.body.authorization,
                      confirm: true,
                      created: new Date(),
                    };
                    return Appointment.create(data)
                      .then(appt =>
                        twilio
                          .sendSMS(
                            constants.APPOINTMENT_SCHEDULED_SMS(
                              appt,
                              user.providerName,
                            ),
                            req.body.mobilePhone,
                          )
                          .then(() =>
                            res.status(202).json({
                              message: constants.APPOINTMENT_CREATED,
                              ...appt.apiGet(),
                            }),
                          ),
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
            const date = format(_app.date, constants.DATE_FORMAT);
            const mapItem = appointmentsMap.get(date);
            if (mapItem) {
              mapItem.push(_app.apiGet());
            } else {
              appointmentsMap.set(date, [_app.apiGet()]);
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
          const keyTimes = getKeyTimes(user, requestDate);
          for (
            let timeSlot = keyTimes.startTime;
            isBefore(timeSlot, keyTimes.endTime);
            timeSlot = addMinutes(timeSlot, keyTimes.appointmentTime)
          ) {
            const overlapsWithBreak = isWithinRange(
              timeSlot,
              keyTimes.breakStartTime,
              addMinutes(keyTimes.breakStartTime, keyTimes.workBreakLength - 1),
            );
            const goesBeyondEndTime = isAfter(
              addMinutes(timeSlot, keyTimes.appointmentTime - 1),
              keyTimes.endTime,
            );
            if (!overlapsWithBreak && !goesBeyondEndTime) {
              if (existingAppointments.length > 0) {
                const alreadyTaken = existingAppointments.find(app =>
                  isEqual(app.time, timeSlot),
                );
                if (!alreadyTaken) {
                  availbleTimeSlots.push(timeSlot);
                }
              } else {
                availbleTimeSlots.push(timeSlot);
              }
            }
          }
          if (availbleTimeSlots.length === 0) {
            return res.status(200).json({
              message: 'No time slots available.',
            });
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

const getKeyTimes = (user, requestDate) => {
  let workDayStartTime;
  let workDayEndTime;
  let workBreakStartTime;
  let workBreakLength;
  let appointmentTime;

  if (user.scheduleType === 'FIXED') {
    workDayStartTime = user.workDayStartTime;
    workDayEndTime = user.workDayEndTime;
    workBreakStartTime = user.workBreakStartTime;
    workBreakLength = user.workBreakLengthMinutes;
    appointmentTime = user.appointmentTime;
  } else {
    const day = startOfDay(requestDate).getDay();
    workDayStartTime = user.workTimes[day].startTime;
    workDayEndTime = user.workTimes[day].endTime;
    workBreakStartTime = user.workTimes[day].breakStartTime;
    workBreakLength = user.workTimes[day].breakLength;
    appointmentTime = user.workTimes[day].appointmentTime;
  }

  let startTime = startOfDay(requestDate);
  startTime = addHours(startTime, parse(workDayStartTime).getHours());
  startTime = addMinutes(startTime, parse(workDayStartTime).getMinutes());
  let endTime = startOfDay(requestDate);
  endTime = addHours(endTime, parse(workDayEndTime).getHours());
  endTime = addMinutes(endTime, parse(workDayEndTime).getMinutes());
  let breakStartTime = startOfDay(requestDate);
  breakStartTime = addHours(
    breakStartTime,
    parse(workBreakStartTime).getHours(),
  );
  breakStartTime = addMinutes(
    breakStartTime,
    parse(workBreakStartTime).getMinutes(),
  );
  return {
    startTime,
    endTime,
    breakStartTime,
    workBreakLength,
    appointmentTime,
  };
};

export default {
  create,
  getAppointments,
  getAvailable,
};
