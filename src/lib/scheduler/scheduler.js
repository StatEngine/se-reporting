import later from 'later';

import { logger } from '../../config/logger';
import Watcher from '../watcher';
import timerStore from './timer-store';
import _ from 'lodash';

function removeTimer(id) {
  timerStore.removeInterval(id);
}

export function schedule(id, laterSchedule, actionName, actionOptions) {
  removeTimer(id);

  const watcher = new Watcher(actionName, actionOptions);
  const interval = later.setInterval(watcher.execute.bind(watcher), laterSchedule);
  timerStore.addInterval(id, interval);
  let name = _.get(actionOptions, 'config_json.name')
  logger.info(`Done scheduling ${name}, next occurence at ${later.schedule(laterSchedule).next(1)}`);
}

export default { schedule };
