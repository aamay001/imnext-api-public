'use strict';

import express from 'express';
import bodyParser from 'body-parser';
import controller from '../controllers/';
import authService from '../service/authentication';

const jwtAuth = authService.jwt;
const jsonParser = bodyParser.json();
const router = express.Router();

router.post('/', jsonParser, controller.humanValidation.create);
router.put('/activate', jwtAuth, jsonParser, controller.humanValidation.activate);
router.put('/validate', jsonParser, controller.humanValidation.activate);

module.exports = router;
