'use strict';

import mongoose, { Schema } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import bcrypt from 'bcrypt';
import constants from '../config/constants';

const { REGEX } = constants;

const UserSchema = new Schema({
  email: {
    type: String,
    trim: true,
    required: true,
    unique: true,
    validate: {
      validator(email) {
        return REGEX.EMAIL.test(email);
      },
      message: 'Invalid email address.',
    },
  },
  password: {
    type: String,
    required: true,
    trim: true,
    sensitive: true,
    validate: {
      validator(password) {
        return REGEX.PASSWORD.test(password);
      },
      message: 'Password does not meet complexity requirement.',
    },
  },
  mobilePhone: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    minlength: 10,
    validate: {
      validator(mobilePhone) {
        return REGEX.PHONE.test(mobilePhone);
      },
      message: 'Invalid mobile phone.',
    },
  },
  firstName: {
    type: String,
    trim: true,
    required: true,
    minlength: 2,
    maxlength: 32,
  },
  lastName: {
    type: String,
    trim: true,
    required: true,
    minlength: 2,
    maxlength: 32,
  },
  workDays: {
    type: Array,
    default: [false, false, false, false, false, false, false],
  },
  workDayStartTime: {
    type: Date,
  },
  workDayEndTime: {
    type: Date,
  },
  workBreakStartTime: {
    type: Date,
  },
  appointmentTime: {
    type: Number,
    default: 45,
  },
  workBreakLengthMinutes: {
    type: Number,
    min: 15,
    max: 120,
    default: 30,
  },
  providerName: {
    type: String,
    trim: true,
    minlength: 8,
    maxlength: 48,
  },
  activated: {
    type: Boolean,
    default: false,
  },
  created: {
    type: Date,
    required: true,
  },
});

UserSchema.plugin(uniqueValidator, {
  message: '{VALUE} is already taken.',
});

UserSchema.pre('save', function(next) {
  if (this.isModified('password')) {
    this.password = this.securePassword(this.password);
    return next();
  }
});

UserSchema.methods = {
  apiGet() {
    return {
      firstName: this.firstName,
      lastName: this.lastName,
      mobilePhone: this.mobilePhone,
      email: this.email,
      workDayStartTime: this.workDayStartTime,
      workDayEndTime: this.workDayEndTime,
      workDays: this.workDays,
      workBreakStartTime: this.workBreakStartTime,
      workBreakLengthMinutes: this.workBreakLengthMinutes,
      appointmentTime: this.appointmentTime,
      providerName: this.providerName,
      activated: this.activated,
    };
  },

  apiGetJwtPayload() {
    return {
      email: this.email,
    };
  },

  apiGetProvider() {
    return {
      providerName: this.providerName,
      providerId: this._id,
      workDays: this.workDays,
      workDayStartTime: this.workDayStartTime,
      workDayEndTime: this.workDayEndTime,
    };
  },
};

UserSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

UserSchema.methods.securePassword = function(password) {
  return bcrypt.hashSync(password, 10);
};

UserSchema.statics = {
  getRequiredForCreate() {
    return ['firstName', 'lastName', 'email', 'mobilePhone', 'password'];
  },

  getRequiredForSettings() {
    return [
      'workDays',
      'workDayStartTime',
      'workDayEndTime',
      'workBreakStartTime',
      'workBreakLengthMinutes',
      'providerName',
      'appointmentTime',
      'email',
    ];
  },
};

export default mongoose.model('User', UserSchema);
