/* eslint "no-unused-vars": 0 */
/* eslint "no-undef": 0 */

'use strict';

import chai from 'chai';
import chaiHttp from 'chai-http';
import { app, startServer, stopServer } from '../app.js';
import factory from '../factories/';
import models from '../models/';
import testUtility from '../utility/testUtil';
import constants from '../config/constants';
import authController from '../service/authentication/auth.controller';

const { HumanValidation, User } = models;

chai.use(chaiHttp);
const should = chai.should();
const expect = chai.expect;
const assert = chai.assert;

describe('HUMAN VALIDATION API'.bgWhite.black, () => {
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

  describe('/is-human/', () => {
    it('should create a human validation record of type APPOINTMENT', () => {
      const data = factory.humanValidation.createOne();
      return chai
        .request(app)
        .post('/is-human/')
        .send(data)
        .then(res => {
          res.should.have.status(201);
          assert(res.body.message, constants.VALIDATION_CREATED);
          return HumanValidation.findOne({ mobilePhone: data.mobilePhone })
            .then(record => {
              expect(record).to.have.property('firstName');
              expect(record).to.have.property('lastName');
              expect(record).to.have.property('mobilePhone');
              expect(record).to.have.property('created');
              expect(record).to.have.property('type');
              expect(record).to.have.property('validationCode');
              expect(record).to.have.property('expiration');
              expect(record).to.have.property('complete');
              expect(record).to.have.property('completedOn');
              record.complete.should.deep.equal(false);
              record.firstName.should.deep.equal(data.firstName);
              record.lastName.should.deep.equal(data.lastName);
              record.mobilePhone.should.deep.equal(data.mobilePhone);
              record.type.should.deep.equal('APPOINTMENT');
            })
        });
    });
  });

  describe('/is-human/validate/', () => {
    it('should validate a validation code and provide authorization.', () => {
      const data = factory.humanValidation.createOne();
      return chai
        .request(app)
        .post('/is-human/')
        .send(data)
        .then(res => {
          res.should.have.status(201);
          assert(res.body.message, constants.VALIDATION_CREATED);
          return HumanValidation.findOne({ mobilePhone: data.mobilePhone })
          .then(record => {
            data.validationCode = record.validationCode;
            return chai.request(app)
              .put('/is-human/validate')
              .send(data)
              .then(validation => {
                validation.should.have.status(202);
                validation.body.should.have.property('authorization');
                return HumanValidation.findOne({ mobilePhone: data.mobilePhone })
                  .then(reValidation => {
                    expect(reValidation).to.have.property('completedOn');
                    expect(reValidation.completedOn).to.not.equal(null);
                    expect(reValidation).to.have.property('complete');
                    expect(reValidation.complete).to.equal(true);
                })
            });
          });
        });
    });
  });

  describe('/is-human/activate/', () => {
    it('should activate a new users account', () => {
      const data = factory.user.createOne();
      return chai
        .request(app)
        .post('/user')
        .send(data)
        .then(res => {
          res.should.contain.status(201);
          return HumanValidation.findOne({mobilePhone: data.mobilePhone})
          .then(_validation => {
            assert(_validation.firstName, data.firstName);
            assert(_validation.lastName, data.lastName);
            data.validationCode = _validation.validationCode;
            const token = authController.createToken(data);
            return chai.request(app)
              .post('/auth/login')
              .auth(data.email, data.password)
              .then(auth => {
                auth.should.have.status(200);
                expect(auth.body).to.include.keys(['authToken']);
                assert(typeof token, 'string');
                assert(auth.body.user.email, data.email);
                assert(auth.body.user.mobilePhone, data.mobilePhone);
                data.authToken = auth.body.authToken;
                const validation = {
                  email: data.email,
                  mobilePhone: data.mobilePhone,
                  validationCode: data.validationCode,
                };
                return chai.request(app)
                  .put('/is-human/activate')
                  .set('Authorization', `Bearer ${data.authToken}`)
                  .send(validation)
                  .then(_res => {
                    _res.should.have.status(202);
                    assert(_res.body.message, constants.ACCOUNT_ACTIVATED);
                    return User.findOne({ email: data.email })
                      .then(user => {
                        assert(user.mobilePhone, data.mobilePhone);
                        assert(user.firstName, data.firstName);
                        assert(user.lastName, data.lastName);
                        assert(user.activated, true);
                      })
                  })
            });
          });
      });
    });
  });
});
