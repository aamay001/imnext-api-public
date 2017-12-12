'use strict';

import fakes from 'faker';
import { addMinutes } from 'date-fns';
import constants from '../config/constants';

const createOne = () => ({
  firstName: fakes.name.firstName(),
  lastName: fakes.name.lastName(),
  mobilePhone: '323-752-6552',
  created: new Date(),
  expiration: addMinutes(new Date(), 30),
  validationCode: Math.floor(
    Math.random() * (constants.PIN_HIGH - constants.PIN_LOW + 1) +
      constants.PIN_LOW,
  )
});

const createMany = count => {
  const validations = [];
  for (let i = 0; i < count; i++) {
    validations.push(createOne());
  }
  return validations;
};

export default {
  createMany,
  createOne,
};
