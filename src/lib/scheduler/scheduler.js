import later from 'later';

import { logger } from '../../config/logger';
import Watcher from '../watcher';
import timerStore from './timer-store';

// schedule everything in UTC
later.date.UTC();

function removeTimers(extensionConfig) {
  const baseKey = [extensionConfig.FireDepartment.firecares_id, extensionConfig.Extension.name].join('-');
  timerStore.removeAllInterval(baseKey);
}

export function schedule(extensionConfig) {
  // remove all timers for this department extension
  removeTimers(extensionConfig);

  logger.info(`Calculating schedule for ${extensionConfig.FireDepartment.name} - ${extensionConfig.Extension.name}`);
  if (extensionConfig.enabled) {
    extensionConfig.config_json.tasks.forEach((task) => {
      logger.info(`Calculating schedule for task ${task.name}`);
      const watcher = new Watcher(extensionConfig.FireDepartment, task);

      const id = [extensionConfig.FireDepartment.firecares_id, extensionConfig.Extension.name, watcher.name].join('-');
      const watcherSchedule = watcher.schedule;

      if (watcherSchedule && watcherSchedule.later) {
        const textSched = later.parse.text(watcherSchedule.later);
        const interval = later.setInterval(watcher.execute.bind(watcher), textSched);
        timerStore.addInterval(id, interval);
      }
    });
  }
  logger.info(`Done scheduling for ${extensionConfig.FireDepartment.name} - ${extensionConfig.Extension.name}`);
}

export default { schedule };
