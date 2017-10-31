'use strict';

import express from 'express';
import bodyParser from 'body-parser';
import controller from '../controllers/';
import authService from '../service/authentication';

const jwtAuth = authService.jwt;
const jsonParser = bodyParser.json();
const router = express.Router();

router.post('/', jsonParser, controller.user.create);
router.put('/settings', jwtAuth, jsonParser, controller.user.updateSettings);
router.get('/', jwtAuth, jsonParser, controller.user.get);

export default router;
