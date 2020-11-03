import later from 'later';
import _ from 'lodash';

import { logger } from '../../config/logger';
import Watcher from '../watcher';
import timerStore from './timer-store';

function removeTimer(id) {
  console.log(`REMOVE: ${id}`);
  timerStore.intervals.forEach((value, key) => {
    console.log(`Before Remove - TimerId: ${key}`);
  });
  timerStore.removeInterval(id);
  timerStore.intervals.forEach((value, key) => {
    console.log(`After Remove - TimerId: ${key}`);
  });
}

export function schedule(id, laterSchedule, actionName, actionOptions) {
  removeTimer(id);

  const watcher = new Watcher(actionName, actionOptions);
  const interval = later.setInterval(watcher.execute.bind(watcher), laterSchedule);
  timerStore.addInterval(id, interval);
  const name = _.get(actionOptions, 'config_json.name');
  logger.info(`Done scheduling ${name}, next occurence at ${later.schedule(laterSchedule).next(1)}`);
}

export default { schedule };
