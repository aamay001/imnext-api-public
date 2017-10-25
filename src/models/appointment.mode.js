'use strict';

import mongoose, {Schema} from 'mongoose';
import {REGEX, DATE_FORMAT} from '../config/constants';
import format from 'date-fns/format';
import User from '../models/user.model';

const AppointmentSchema = new Schema({
  user_id: {
    type: String,
    required: true,
    validate: {
      validator: v => User.findById(v),
      message: 'Invalid user id.'
    }
  },
  firstName: {
    type: String,
    require: true,
    validate : {
      validator: v => v.length >= 2 && v.length <= 32,
      message: 'First name must be between 2 and  32 characters long.'
    },
    lastName: {
      type: String,
      required: true,
      validate: {
        validator: v => v.length >= 2 && v.length <= 32,
        message: 'Last name must be between 2 and  32 characters long.'
      }
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
    date: {
      type: Date,
      required: true,
      validate: {
        validator: v => format(v, DATE_FORMAT) >= format(new Date(), DATE_FORMAT),
        message: 'Date is invalid. Date must be present or future.'
      }
    },
    time: {
      type: Date,
      required: true
    },
    confirmed: {
      type: Boolean,
      default: false
    }
  }
});

AppointmentSchema.methods.apiGet = function() {
  return {
    name: `${this.firstName} ${this.lastName}`,
    mobilePhone: this.mobilePhone,
    date: this.date,
    time: this.time,
    confirmed: this.confirmed
  }
}

export default mongoose.model('Appointment', AppointmentSchema);