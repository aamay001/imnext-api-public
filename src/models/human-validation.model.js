'use strict';

import mongoose, { Schema } from 'mongoose';
import addMinutes from 'date-fns/add_minutes';
import constants from '../config/constants';

const { REGEX } = constants;

const HumanValidationSchema = new Schema({
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
  mobilePhone: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: v => REGEX.PHONE.test(v),
      message: 'Mobile phone is not in a valid format.',
    },
  },
  validationCode: {
    type: Number,
    min: 10000000,
    max: 99999999,
    default: Math.floor(Math.random() * (99999999 - 10000000 + 1) + 10000000),
  },
  expiration: {
    type: Date,
    default: addMinutes(new Date(), 30),
  },
  complete: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    enum: ['ACTIVATION', 'APPOINTMENT'],
    required: true,
    default: 'APPOINTMENT',
  },
  created: {
    type: Date,
    default: new Date(),
  },
  completedOn: {
    type: Date,
    default: null,
  },
});

HumanValidationSchema.statics = {
  getRequiredForCreate() {
    return ['firstName', 'lastName', 'mobilePhone'];
  },

  getRequiredForActivation() {
    return ['mobilePhone', 'email', 'validationCode'];
  },

  getRequiredForValidation() {
    return ['mobilePhone', 'validationCode'];
  },
};

export default mongoose.model('HumanValidation', HumanValidationSchema);
