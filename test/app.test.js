'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;

const {app, startServer, stopServer} = require('../app');
const {config, constants} = require('../config');

describe('Server Start and Stop', () => {
  describe('START', () => {
    it('should start the server.', () => {
      return expect(startServer(config.TEST_DATABASE_URL)).to.be.fulfilled;
    });
  });
  describe('STOP', () => {
    it('should stop the server', () => {
      return expect(stopServer()).to.be.fulfilled;
    });
  });
});