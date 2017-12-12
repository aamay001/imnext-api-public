'use strict';

import mongoose, { Schema } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import format from 'date-fns/format';
import User from '../models/user.model';
import constants from '../config/constants';

const { REGEX, DATE_FORMAT } = constants;

const AppointmentSchema = new Schema({
  user_id: {
    // Provider ID
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: v => User.findById(v),
      message: 'Invalid user id.',
    },
  },
  firstName: {
    type: String,
    require: true,
    trim: true,
    validate: {
      validator: v => v.length >= 2 && v.length <= 32,
      message: 'First name must be between 2 and  32 characters long.',
    },
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: v => v.length >= 2 && v.length <= 32,
      message: 'Last name must be between 2 and  32 characters long.',
    },
  },
  mobilePhone: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: v => REGEX.PHONE.test(v),
      message: 'Mobile phone is not in a valid format.',
    },
  },
  date: {
    type: Date,
    required: true,
    validate: {
      validator: v => format(v, DATE_FORMAT) >= format(new Date(), DATE_FORMAT),
      message: 'Date must be present or future.',
    },
  },
  time: {
    type: Date,
    required: true,
  },
  confirmed: {
    type: Boolean,
    default: false,
  },
  authorization: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  created: {
    type: Date,
    required: true,
  },
  cancelled: {
    type: Boolean,
    default: false,
  },
});

AppointmentSchema.plugin(uniqueValidator, {
  message: 'Invalid authorization.',
});

AppointmentSchema.methods.apiGet = function() {
  return {
    name: `${this.firstName} ${this.lastName}`,
    mobilePhone: this.mobilePhone,
    date: this.date,
    time: this.time,
    confirmed: this.confirmed,
    id: this._id,
  };
};

AppointmentSchema.statics = {
  getRequiredForCreate() {
    return [
      'providerId',
      'firstName',
      'lastName',
      'mobilePhone',
      'date',
      'time',
      'authorization',
    ];
  },
  getRequiredForGet() {
    return [
      'email',
      'date'
    ];
  },
};

export default mongoose.model('Appointment', AppointmentSchema);
