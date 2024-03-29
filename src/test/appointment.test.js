/* eslint "no-undef": 0 */

import chai from 'chai';
import chaiHttp from 'chai-http';
import { app, startServer, stopServer } from '../app.js';
import factory from '../factories/';
import models from '../models/';
import testUtility from '../utility/testUtil';
import constants from '../config/constants';
import authController from '../service/authentication/auth.controller';

const {User, Appointment, HumanValidation} = models;

chai.use(chaiHttp);
const should = chai.should();
const expect = chai.expect;
const assert = chai.assert;

describe('APPOINTMENTS API'.bgWhite.black, () => {
  before(() => {
    startServer();
  });

  after(() => {
    stopServer();
  });

  afterEach(() => testUtility.clearCollection('appointments')
    .then(() => testUtility.clearCollection('humanvalidations'))
    .then(() => testUtility.clearCollection('users'))
  );

  describe('/appointments/cancel', () => {
    it('should cancel an existing appointment', () => {
      const provider = factory.user.createOne();
      let client = factory.humanValidation.createOne();
      let authToken;
      return User.create(provider)
        .then( user => {
          authToken = authController.createToken(user.apiGet());
          return HumanValidation.create(client)
            .then( humanValidation => {
              client.user_id = user._id;
              client.authorization = humanValidation._id;
              client = factory.appointment.createOne(client);
              return Appointment.create(client)
                .then(appointment => {
                  client.appointmentId = appointment._id;
                  assert(appointment.firstName, client.firstName);
                  assert(appointment.lastName, client.lastName);
                  assert(appointment.user_id, client.user_id);
                  assert(appointment.authorization, client.authorization);
                  expect(appointment.cancelled).to.equal(false);
                  return chai.request(app)
                    .put('/appointment/cancel')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({
                      appointmentId: appointment._id,
                      email: user.email
                    })
                    .then( res => {
                      res.should.have.status(202);
                      expect(res.body.message).to.equal(constants.APPOINTMENT_CANCELLED);
                      return Appointment.findById(client.appointmentId)
                        .then( cancelledAppointment => {
                          assert(cancelledAppointment.cancelled, true);
                        });
                    });
                });
            });
        });
    });
  });
});