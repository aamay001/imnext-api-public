'use strict';

import express from 'express';
import bodyParser from 'body-parser';
import controllers from '../controllers/';
import authService from '../service/authentication';

const jwtAuth = authService.jwt;
const jsonParser = bodyParser.json();
const router = express.Router();

router.post('/', jsonParser, controllers.appointment.create);
router.get('/available', jsonParser, controllers.appointment.getAvailable);
router.get(
  '/provider',
  jwtAuth,
  jsonParser,
  controllers.appointment.getAppointments,
);
router.put(
  '/cancel',
  jwtAuth,
  jsonParser,
  controllers.appointment.cancel);

export default router;
