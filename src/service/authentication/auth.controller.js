'use strict';

import passport from 'passport';
import jwt from 'jsonwebtoken';

import { config } from '../../config';
import strategies from './auth.strategies';

const NO_SESSION = { session: false };
const JWT_ALGORITHM = 'HS256';

function init(app) {
  app.use(passport.initialize());
  passport.use(strategies.basicStrategy);
  passport.use(strategies.tokenStrategy);
}

const createAuthToken = user =>
  jwt.sign({ user }, config.TOKEN_SECRET, {
    subject: user.email,
    expiresIn: config.TOKEN_EXP,
    algorithm: JWT_ALGORITHM,
  });

const verifyAuthToken = token =>
  jwt.verify(token, config.TOKEN_SECRET, { algorithm: [JWT_ALGORITHM] });

const basic = passport.authenticate('basic', NO_SESSION);
const jsonWebToken = passport.authenticate('jwt', NO_SESSION);

module.exports = {
  createToken: createAuthToken,
  verifyToken: verifyAuthToken,
  basic,
  jwt: jsonWebToken,
  init,
};
