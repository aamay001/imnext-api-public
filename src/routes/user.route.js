'use strict';

import express from 'express';
import bodyParser from 'body-parser';
import controller from '../controllers/';

const jsonParser = bodyParser.json();
const router = express.Router();

router.post('/', jsonParser, controller.user.createUser)

export default router;
