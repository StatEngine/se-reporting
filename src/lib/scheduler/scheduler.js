import later from 'later';
import _ from 'lodash';

import { logger } from '../../config/logger';
import Watcher from '../watcher';
import timerStore from './timer-store';

function removeTimer(id) {
  timerStore.removeInterval(id);
}

function getConfigName(config) {
  if (config.config_json) {
    return config.config_json.name;
  }
  if (config.name) {
    return config.name;
  }

  return 'noName';
}

export function schedule(id, laterSchedule, actionName, actionOptions) {
  removeTimer(id);

  const watcher = new Watcher(actionName, actionOptions);
  const interval = later.setInterval(watcher.execute.bind(watcher), laterSchedule);
  timerStore.addInterval(id, interval);
  const name = getConfigName(actionOptions);
  logger.info(`Done scheduling ${name}, next occurence at ${later.schedule(laterSchedule).next(1)}`);
}

export default { schedule };
