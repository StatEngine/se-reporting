import _ from 'lodash';

import { logger } from '../../config/logger';

import customEmail from './customEmail';
import emailReport from './emailReport';
import testAction from './testAction';

const registrations = {
  CustomEmail: customEmail,
  EmailReport: emailReport,
  TestAction: testAction,
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
