import _ from 'lodash';

import { logger } from '../../config/logger';

import console from './console';
import email from './email';
import webhook from './webhook';
import twitter from './twitter';

const registrations = {
  console,
  email,
  webhook,
  twitter,
};

export function createAction(type, fireDepartment, options = {}) {
  const Action = registrations[type];
  if (!Action) {
    logger.error(`Unknown Action type: ${type}`);
    return undefined;
  }

  return new Action(fireDepartment, _.cloneDeep(options));
}

export default { createAction };
