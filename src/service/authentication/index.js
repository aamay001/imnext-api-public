'use strict';

import router from './auth.route';
import controller from './auth.controller';

export default {
  router,
  init: controller.init,
  jwt: controller.jwt,
  basic: controller.basic,
};
