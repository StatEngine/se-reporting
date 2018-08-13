import _ from 'lodash';

import { logger } from '../../config/logger';

import emailReport from './emailReport';

const registrations = {
  EmailReport: emailReport,
};

export function createAction(name, options = {}) {
  const Action = registrations[name];
  if (!Action) {
    logger.error(`Unknown Action: ${name}`);
    return undefined;
  }

  return new Action(_.cloneDeep(options));
}

export default { createAction };
