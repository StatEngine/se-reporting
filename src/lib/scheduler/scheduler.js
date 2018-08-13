import later from 'later';

import { logger } from '../../config/logger';
import Watcher from '../watcher';
import timerStore from './timer-store';

function removeTimer(id) {
  timerStore.removeInterval(id);
}

export function schedule(id, laterSchedule, actionName, actionOptions) {
  removeTimer(id);

  const watcher = new Watcher(actionName, actionOptions);
  const interval = later.setInterval(watcher.execute.bind(watcher), laterSchedule);
  timerStore.addInterval(id, interval);
  logger.info(`Done scheduling ${id}, next occurence at ${later.schedule(laterSchedule).next(1)}`);
}

export default { schedule };
