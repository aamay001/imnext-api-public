'use strict';

import user from './user.route';
import authService from '../service/authentication';
import humanValidation from '../routes/human-validation.route';
import appointment from '../routes/appointment.route';
import provider from '../routes/provider.route';

const auth = authService.router;

export default {
  appointment,
  auth,
  humanValidation,
  provider,
  user,
};
