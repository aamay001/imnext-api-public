'use strict';

import user from './user.route';
import authService from '../service/authentication';

const auth = authService.router;

module.exports = {
  user,
  auth
}