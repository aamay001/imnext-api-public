'use strict';

import chai from 'chai';
import chaiHttp from 'chai-http';
import { startServer, stopServer, app } from '../app';
import settings from '../config/';

const { config } = settings;

chai.use(chaiHttp);
const expect = chai.expect;

describe('STATIC, SERVE', () => {
  before(() => startServer(config.TEST_DATABASE_URL));

  after(() => stopServer());

  describe('index.html', () => {
    it('should serve the static index.html file', () =>
      chai
        .request(app)
        .get('/')
        .then(res => {
          expect(res.status).to.equal(200);
          expect(res.type).to.equal('text/html');
        }));
  });
});
