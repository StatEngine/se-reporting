import _ from 'lodash';

import { logger } from '../../config/logger';

import sendEmailReport from './sendEmailReport';

const registrations = {
  sendEmailReport,
};

export function createAction(type, options = {}) {
  const Action = registrations[type];
  if (!Action) {
    logger.error(`Unknown Action type: ${type}`);
    return undefined;
  }

  return new Action(_.cloneDeep(options));
}

export default { createAction };
