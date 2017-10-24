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
  },
});

export default mongoose.model('User', UserSchema);
