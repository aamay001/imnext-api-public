/* eslint-disable no-console */
'use strict';

import mongoose from 'mongoose';

mongoose.Promise = global.Promise;

function dropDatabase(){
  console.warn('Dropping database.'.magenta);
  return mongoose.connection.dropDatabase();
}

function clearCollection(collectionName) {
  console.warn(`Clearing collection ${collectionName.yellow}.`.magenta);
  return mongoose.connection.collections[collectionName].deleteMany({});
}

export default {
  dropDatabase,
  clearCollection
}