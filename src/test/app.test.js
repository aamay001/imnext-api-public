'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiHttp);
chai.use(chaiAsPromised);
const expect = chai.expect;

const { startServer, stopServer } = require('../app');
const config = require('../config/config')

describe('Server Start and Stop', () => {
  describe('START', () => {
    it('should start the server.', () =>
      expect(startServer(config.TEST_DATABASE_URL)).to.be.fulfilled);
  });
  describe('STOP', () => {
    it('should stop the server', () => expect(stopServer()).to.be.fulfilled);
  });
});
