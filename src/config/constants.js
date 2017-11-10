'use strict';
import format from 'date-fns/format';
import config from './config';
import colors from 'colors';

const REGEX = {
  PASSWORD: new RegExp(
    /^(?:(?=.*[a-z])(?:(?=.*[A-Z])(?=.*[\d\W])|(?=.*\W)(?=.*\d))|(?=.*\W)(?=.*[A-Z])(?=.*\d)).{8,}$/,
  ),
  PHONE: new RegExp(
    /^(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?$/,
  ),
  EMAIL: new RegExp(
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  ),
};

const DATE_FORMAT = 'YYYY-MM-DD';
const DISPLAY_DATE_FORMAT = 'dddd, MMMM DD';
const DISPLAY_TIME_FORMAT = 'H:mm A';

export default {
  REGEX,
  DATE_FORMAT,
  DISPLAY_TIME_FORMAT,
  SERVER_START_SUCCESS: `Server start success. Server is listening on port ${config.PORT}.`
    .green,
  SERVER_START_ERROR: err => `Server start error. Error: ${err}`.red,
  SERVER_STOPPING: `Server is stopping.`,
  SERVER_STOP_ERROR: err => `Server stop error. Error: ${err}`.red,
  SERVER_DB_CONNECT_ERROR: err => `Database connect error. Error: ${err}`.red,
  SERVER_DB_CONNECT_SUCCESS: db =>
    `Database connect success. Connected to ${db}.`.green,
  USER_CREATE_SUCCESS: 'User account created!',
  MISSING_FIELD: field => `Missing ${field} in request.`,
  APPOINTMENT_VALIDATION_SMS: code =>
    `imNext Appointment Validation Code: ${code}\nExpires in 30 minutes`,
  ACCOUNT_ACTIVATION_SMS: code =>
    `imNext Account Activation Code: ${code}\nExpires in 30 minutes.`,
  VALIDATION_CREATED: 'Human validation created.',
  VALIDATION_EXISTS:
    'Validations can only be generated every 30 minutes for same mobile. Use existing validation code first.',
  RECAPTCHA_FAILED: 'reCAPTCHA validation failed.',
  EMAIL_AUTH_MISMATCH: `Invalid authentication.`,
  MOBILE_AUTH_MISMATCH: `Invalid authentication`,
  ACCOUNT_ACTIVATED: 'User account activated.',
  ACCOUNT_ACTIVATION_FAILED: 'Activation could not be processed.',
  VALIDATION_INVALID: 'Validation code is invalid or expired.',
  VALIDATION_SUCCESS: 'Validation successful.',
  VALIDATION_FAILED: 'Validation could not be processed.',
  INTERNAL_SERVER_ERROR: 'Internal server error.',
  USER_NOT_FOUND: 'User not found',
  PROVIDER_NOT_FOUND: 'Provider not found',
  USER_ACCOUNT_NOT_ACTIVATED: 'User account is not activated',
  APPOINTMENT_DATETIME_UNAVAIL:
    'The appointment date and time is no longer available.',
  APPOINTMENT_CREATED: 'Appointment scheduled!',
  APPOINTMENT_SCHEDULED_SMS: (appt, provider) =>
    `Appointment Scheduled: ${format(
      appt.date,
      DISPLAY_DATE_FORMAT,
    )} at ${format(
      appt.time,
      'h:mm A',
    )} with ${provider}. Thanks for using imNext!`,
};
