'use strict';

import fakes from 'faker';

const createOne = (data) => {
  const dateTime = fakes.date.future();
  return {
    ...data,
    firstName: data.firstName,
    lastName: data.lastName,
    mobilePhone: '323-752-6552',
    providerId: data.user_id,
    user_id: data.user_id,
    date: dateTime,
    time: dateTime,
    authorization: data.authorization,
    created: new Date()
  }
}

const createMany = (data, count) => {
  const appointments = [];
  for (let i = 0; i < count; i++) {
    appointments.push(createOne(data));
  }
  return appointments;
}

export default {
  createOne,
  createMany
}