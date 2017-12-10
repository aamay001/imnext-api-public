/* eslint "no-unused-vars": 0 */

'use strict';

import chai from 'chai';
import chaiHttp from 'chai-http';
import { app, startServer, stopServer } from '../app.js';
import factory from '../factories';
import models from '../models';
import testUtility from '../utility/testUtil';
import constants from '../config/constants';
import authController from '../service/authentication/auth.controller';

const { User } = models;

chai.use(chaiHttp);
const should = chai.should();
const expect = chai.expect;
const assert = chai.assert;

describe('USER API'.bgWhite.black, () => {
  before(() => {
    startServer();
  });

  after(() => {
    stopServer();
  });

  afterEach(() => {
    testUtility.clearCollection('humanvalidations');
    testUtility.clearCollection('users');
  });

  describe('/user', () => {
    it('should create a new user', () => {
      const data = factory.user.createOne();
      return chai
        .request(app)
        .post('/user')
        .send(data)
        .then(res => {
          res.should.contain.status(201);
          assert(res.body.message, constants.USER_CREATE_SUCCESS);
        })
        .then(() =>
          User.findOne({ mobilePhone: data.mobilePhone }).then(user => {
            assert(user.firstName, data.firstName);
            assert(user.lastName, data.lastName);
            assert(user.email, data.email);
            return user.validatePassword(data.password);
          }),
        )
        .then(isValid => {
          assert(isValid, true);
          console.log('User created with matching password.'.green);
        });
    });
  });
});
