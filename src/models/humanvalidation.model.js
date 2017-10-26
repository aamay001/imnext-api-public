'use strict';

import mongoose, {Schema} from 'mongoose';
import addMinutes from 'date-fns/add_minutes';
import { REGEX } from '../config/constants';

const HumanValidationSchema = new Schema({
  mobilePhone: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: v => REGEX.PHONE.test(v),
      message: 'Mobile phone is not in a valid format.'
    }
  },
  validationCode: {
    type: Number,
    required: true,
    min: 100000000,
    max: 99999999,
    default: Math.floor(Math.random()*(99999999-10000000+1)+10000000)
  },
  expiration: {
    type: Date,
    require: true,
    default: addMinutes(new Date(), 30)
  },
  complete: {
    type: Boolean,
    required: true,
    default: false
  }
});

HumanValidationSchema.methods.apiGet = function() {
  return {
    mobilePhone: this.mobilePhone,
    code: this.validationCode,
    expiration: this.expiration,
    complete: this.complete
  }
}

const HumanValidation = mongoose.model('HumanValidation', HumanValidationSchema);
module.exports = {HumanValidation};