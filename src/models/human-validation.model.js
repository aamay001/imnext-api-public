'use strict';

import mongoose, { Schema } from 'mongoose';
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
    required: true,
  },
  expiration: {
    type: Date,
    required: true,
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
    required: true,
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
