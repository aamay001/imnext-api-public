'use strict';

import mongoose, { Schema } from 'mongoose';
import { REGEX } from '../config/constants';

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: v => REGEX.EMAIL.test(v),
      message: '{VALUE} is not a valid email address.',
    },
  },
  password: {
    type: String,
    required: true,
    validate: {
      validator: v => REGEX.PASSWORD.test(v),
      message: 'Passsword does not meet complexity requirement.',
    },
  mobilePhone: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: v => REGEX.PHONE.test(v),
      message: 'Mobile phone is not in a valid format.'
    }
  },
  firsName: {
    type: String,
    required: true,
    validate : {
      validator: v => v.length >= 2 && v.length <= 32,
      message: 'First name must be between 2 and  32 characters long.'
    }
  },
  lastName: {
    type: String,
    required: true,
    validate: {
      validator: v => v.length >= 2 && v.length <= 32,
      message: 'Last name must be between 2 and  32 characters long.'
    }
  },
  workHoursPerDay: {
    type: Number,
    default: 8,
    validate: {
      validator: v => v > 0 && v < 16,
      message: 'Work hours per day must be between 1 and 16',
    }
  },
  workDays: {
    type: Array,
    default: [
      false,
      false,
      false,
      false,
      false,
      false,
      false
    ]
  },
  workDayStartTime: {
    type: Date
  },
  workDayEndTime: {
    type: Date
  }
  },
});

UserSchema.methods.apiGet = function() {
  return {
    firsName: this.firsName,
    lastName: this.lastName,
    mobilePhone: this.mobilePhone
  }
}

UserSchema.methods.apiGetWorkConfig = function() {
  return {
    workDayStartTime: this.workDayStartTime,
    workDayEndTime: this.workDayEndTime,
    workDays: this.workDays,
    workHoursPerDay: this.workHoursPerDay
  }
}

export default mongoose.model('User', UserSchema);
