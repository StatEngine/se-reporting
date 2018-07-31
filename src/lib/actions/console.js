/* eslint class-methods-use-this: ["error", { "exceptMethods": ["notify"] }] */
import { logger } from '../../config/logger';

import Action from './action';

class Console extends Action {
  notify(payload) {
    logger.info('Console notify()');
    logger.info(payload);
    return Promise.resolve();
  }
}

export default Console;
