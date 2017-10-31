'use strict';

import user from './user.route';
import authService from '../service/authentication';
import humanValidation from '../routes/human-validation.route';

const auth = authService.router;

module.exports = {
  user,
  auth,
  humanValidation,
};
