'use strict';

import { BasicStrategy } from 'passport-http';
import { Strategy, ExtractJwt } from 'passport-jwt';
import models from '../../models/';
import config from '../../config/config';

const { TOKEN_SECRET } = config;
const { User } = models;
const JwtStrategy = Strategy;

const INVALID_LOGIN = {
  message: 'Incorrect email or password.',
  ok: false,
};

const basicStrategy = new BasicStrategy((email, password, callback) => {
  let user;
  const _email = email.toLowerCase();
  User.findOne({ email: _email })
    .then(_user => {
      user = _user;
      if (!user) {
        return callback(null, INVALID_LOGIN);
      }
      return user.validatePassword(password);
    })
    .then(isValid => {
      if (!isValid) {
        return callback(null, INVALID_LOGIN);
      }
      user.ok = true;
      return callback(null, user);
    })
    .catch(err => callback(err, false));
});

const tokenStrategy = new JwtStrategy(
  {
    secretOrKey: TOKEN_SECRET,
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
    algorithms: ['HS256'],
  },
  (payload, done) => {
    done(null, payload.user);
  },
);

export default {
  basicStrategy,
  tokenStrategy,
};
