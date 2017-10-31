/* eslint-disable no-console */
'use strict';

import express from 'express';
import auth from './auth.controller';

const router = express.Router();

router.post('/login', auth.basic, (req, res) => {
  if (!req.user.ok) {
    return res.status(401).send(req.user);
  }
  const authToken = auth.createToken(req.user.apiGet());
  console.info(`User authenticated: ${req.user.email}`.cyan);
  return res.status(200).json({ authToken });
});

router.post('/refresh', auth.jwt, (req, res) => {
  if (!req.user) {
    return res.status(401).send(req.user);
  }
  const authToken = auth.createToken(req.user);
  console.info(`Token refresh: ${req.user.email}`.cyan);
  return res.json({ authToken });
});

export default router;
