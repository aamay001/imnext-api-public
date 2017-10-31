'use strict';

import passport from 'passport';
import jwt from 'jsonwebtoken';

import settings from '../../config';
import strategies from './auth.strategies';

const { config } = settings;
const NO_SESSION = { session: false };

function init(app) {
  app.use(passport.initialize());
  passport.use(strategies.basicStrategy);
  passport.use(strategies.tokenStrategy);
}

const createAuthToken = user =>
  jwt.sign({ user }, config.TOKEN_SECRET, {
    subject: user.email,
    expiresIn: config.TOKEN_EXP,
  });

const verifyAuthToken = token => jwt.verify(token, config.TOKEN_SECRET);

const basic = passport.authenticate('basic', NO_SESSION);
const jsonWebToken = passport.authenticate('jwt', NO_SESSION);

export default {
  createToken: createAuthToken,
  verifyToken: verifyAuthToken,
  basic,
  jwt: jsonWebToken,
  init,
};
