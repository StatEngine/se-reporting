import _ from 'lodash';
import parse from 'json-templates';

import { logger } from '../config/logger';
import es from './connection/elasticsearch';
import { createAction } from './actions/action-factory';
import { createPreprocessor } from './preprocessors/preprocessor-factory';

class Watcher {
  constructor(fireDepartment, taskConfig) {
    this.fireDepartment = fireDepartment;
    this.taskConfig = taskConfig;
  }

  get name() {
    return this.taskConfig.name;
  }

  set name(_name) {
    this.taskConfig.name = _name;
  }

  get schedule() {
    return this.taskConfig.schedule;
  }

  set schedule(_schedule) {
    this.taskConfig.schedule = _schedule;
  }

  get queries() {
    return this.taskConfig.queries;
  }

  set queries(queries) {
    this.taskConfig.queries = queries;
  }

  get transforms() {
    return this.taskConfig.transforms;
  }

  set transforms(transforms) {
    this.taskConfig.transforms = transforms;
  }

  get actions() {
    return this.taskConfig.actions;
  }

  set actions(actions) {
    this.taskConfig.actions = actions;
  }

  execute() {
    logger.info(`${this.name}: executing`);

    const payload = {};
    this.preprocess()
      .then((queryVars) => {
        payload.preprocessors = queryVars;
        return this.query(payload);
      })
      .then((queryResults) => {
        payload.queryResults = queryResults;
        return this.transform(payload);
      })
      .then((transformedResult) => {
        payload.result = transformedResult;
        return this.action(payload);
      })
      .catch((err) => {
        logger.error(`${this.name}: error occurred`);
        logger.error(err);
      })
      .then(() => {
        logger.info(`${this.name}: done executing`);
      });
  }

  preprocess() {
    let vars = {};

    this.taskConfig.preprocessors.forEach((preprocessorConfig) => {
      const preprocessor = createPreprocessor(preprocessorConfig.type, preprocessorConfig.options);
      const results = {};
      results[preprocessorConfig.type] = preprocessor.preprocess();
      vars = _.assign(vars, results);
    });

    return Promise.resolve(vars);
  }

  query(payload) {
    if (!this.taskConfig.queryTemplates || this.taskConfig.queryTemplates.length === 0) {
      return Promise.resolve([]);
    }

    const promises = [];
    this.taskConfig.queryTemplates.forEach((queryTemplate) => {
      const template = parse(queryTemplate);

      const query = template(payload.preprocessors);

      promises.push(es.getClient()[query.type](query.request));
    });
    return Promise.all(promises);
  }

  transform(payload) {
    if (!this.taskConfig.transforms || this.taskConfig.transforms.length === 0) {
      return Promise.resolve(_.flatten(payload.queryResults));
    }

    const result = {};

    this.taskConfig.transforms.forEach((transform) => {
      if (transform.type === 'set') {
        _.set(result, transform.path, _.get(payload, transform.value));
      } else {
        logger.warn('Unknown transform');
      }
    });

    return Promise.resolve(result);
  }

  action(transformedResults) {
    if (!this.taskConfig.actions || this.taskConfig.actions.length === 0) {
      return Promise.resolve(transformedResults);
    }

    const promises = [];
    this.taskConfig.actions.forEach((actionConfig) => {
      const action = createAction(actionConfig.type, this.fireDepartment, actionConfig.options);
      promises.push(action.notify(transformedResults));
    });
    return Promise.all(promises);
  }
}

export default Watcher;
