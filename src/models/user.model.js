'use strict';

import mongoose, { Schema } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import bcrypt from 'bcrypt';
import { REGEX } from '../config/constants';

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
    minlength: 8,
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
  workHoursPerDay: {
    type: Number,
    default: 8,
    min: 0,
    max: 16,
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
  workBreakLengthMinutes: {
    type: Number,
    min: 15,
    max: 120,
  },
  providerName: {
    type: String,
    trim: true,
    minlength: 8,
    maxlength: 64,
  },
  activated: {
    type: Boolean,
    default: false
  },
  created: {
    type: Date,
    default: new Date()
  }
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

UserSchema.methods.apiGet = function() {
  return {
    firsName: this.firstName,
    lastName: this.lastName,
    mobilePhone: this.mobilePhone,
    email: this.email,
  };
};

UserSchema.methods.apiGetWorkSettings = function() {
  return {
    workDayStartTime: this.workDayStartTime,
    workDayEndTime: this.workDayEndTime,
    workDays: this.workDays,
    workHoursPerDay: this.workHoursPerDay,
    workBreakStartTime: this.workBreakStartTime,
    workBreakLengthMinutes: this.workBreakLengthMinutes,
    providerName: this.providerName,
  };
};

UserSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

UserSchema.methods.securePassword = function(password) {
  return bcrypt.hashSync(password, 10);
};

UserSchema.statics.getRequiredForCreate = function() {
  return ['firstName', 'lastName', 'email', 'mobilePhone', 'password'];
};

UserSchema.statics.getRequiredForSettings = function() {
  return [
    'workHoursPerDay',
    'workDays',
    'workDayStartTime',
    'workDayEndTime',
    'workBreakStartTime',
    'workBreakLengthMinutes',
    'providerName',
    'email',
  ];
};

const User = mongoose.model('User', UserSchema);
module.exports = { User };
