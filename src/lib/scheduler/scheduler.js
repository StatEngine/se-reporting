import later from 'later';

import { logger } from '../../config/logger';
import Watcher from '../watcher';
import timerStore from './timer-store';

function removeTimer(id) {
  /*const baseKey = [extensionConfig.FireDepartment.firecares_id, extensionConfig.Extension.name].join('-');
  timerStore.removeAllInterval(baseKey);*/
}

export function schedule(id, laterSchedule, task) {
  removeTimer(id);

  const watcher = new Watcher(task);
  const interval = later.setInterval(watcher.execute.bind(watcher), laterSchedule);
  timerStore.addInterval(id, interval);
  logger.info(`Done scheduling ${id}`);
}

export default { schedule };
