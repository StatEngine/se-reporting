import _ from 'lodash';

import { logger } from '../config/logger';
import { createAction } from './actions/action-factory';

class Watcher {
  constructor(id, fireDepartment, task) {
    this.id = id;
    this.fireDepartment = fireDepartment;
    this.task = task;
  }

  get name() {
    return this.task.name;
  }

  set name(_name) {
    this.task.name = _name;
  }

  get schedule() {
    return this.task.schedule;
  }

  set schedule(_schedule) {
    this.task.schedule = _schedule;
  }

  execute() {
    logger.info(`${this.name}: executing`);

    const action = createAction(this.task.type, this.fireDepartment, this.task.options);

    return action.run();
  }
}

export default Watcher;
