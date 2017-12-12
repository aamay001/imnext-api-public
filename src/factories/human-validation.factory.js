'use strict';

import fakes from 'faker';

const createOne = () => ({
  firstName: fakes.name.firstName(),
  lastName: fakes.name.lastName(),
  mobilePhone: '323-752-6552',
  created: new Date()
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
