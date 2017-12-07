'use strict';

import fakes from 'faker';

const createOne = () => ({
  firstName: fakes.name.firstName(),
  lastName: fakes.name.lastName(),
  mobilePhone: '323-752-6552',
  email: fakes.internet.email(),
  password: '1234Abcd!'
});

const createMany = (count) => {
  const users = [];
  for(let i = 0; i < count; i++) {
    users.push(createOne());
  }
  return users;
}

export default {
  createMany,
  createOne
}