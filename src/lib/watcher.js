import { logger } from '../config/logger';
import { createAction } from './actions/action-factory';

class Watcher {
  constructor(actionName, actionOptions) {
    this.actionName = actionName;
    this.actionOptions = actionOptions;
  }

  execute() {
    logger.info(`${this.actionName}: executing`);

    const action = createAction(this.actionName, this.actionOptions);

    return action.run();
  }
}

export default Watcher;
