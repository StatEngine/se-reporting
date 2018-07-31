import _ from 'lodash';

import shiftly from './shiftly';
import daily from './daily';

import { logger } from '../../config/logger';

const registrations = {
  shiftly,
  daily,
};

export function createPreprocessor(type, options = {}) {
  const Preprocessor = registrations[type];
  if (!Preprocessor) {
    logger.error(`Unknown Preprocessor type: ${type}`);
    return undefined;
  }

  return new Preprocessor(_.cloneDeep(options));
}

export default { createPreprocessor };
