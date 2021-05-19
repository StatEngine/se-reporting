import request from 'request-promise';
import _ from 'lodash';
import moment from 'moment';
import promiseRetry from 'promise-retry';
import config from '../../config';
import Action from './action';

class EmailReport extends Action {
  constructor(options) {
    super(options);
    this.retryOptions = {
      retries: 10,
      factor: 3,
      minTimeout: 1000,
      maxTimeout: 1000 * 60 * 5, // 5 minutes
      randomize: 1.1,
    };
  }


  run() {
    console.info('Running EmailReport Action');
    console.dir(this.options);

    const requestOptions = _.cloneDeep(config.statengine);
    let previous = true;
    if (!_.isNil(this.options.config_json.previous)) previous = this.options.config_json.previous;
    console.info(`previous = ${previous}`);

    requestOptions.uri += '/email/timeRangeAnalysis';
    requestOptions.qs = {
      configurationId: this.options._id,
      fireDepartmentId: this.options.fire_department__id,
      startDate: moment().format(),
      previous,
      test: false,
    };
    requestOptions.json = true;
    requestOptions.method = 'POST';

    console.log(`Calling TimeRangeAnalysis API for ${this.options.fire_department__id} fire department id`);

    return promiseRetry(this.retryOptions, (retryCallback, attempt) => request(requestOptions).catch((error) => {
      this.loggError(error, attempt);
      retryCallback(error);
    })).then((params) => {
      this.logSuccess();
      return params;
    }).catch((error) => {
      this.loggError(error);
    });
  }

  logSuccess() {
    console.info(`Call to TimeRangeAnalysis API succeeded for ${this.options.fire_department__id} fire department id`);
  }

  loggError(number, error) {
    console.error(`Error - Calling TimeRangeAnalysis API failed for ${this.options.fire_department__id} fire department id`);
    if (number) {
      console.error(`Error - Call attempt number ${number}`);
    }
    console.dir(error);
  }
}

export default EmailReport;
