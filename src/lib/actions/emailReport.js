import request from 'request-promise';
import _ from 'lodash';
import moment from 'moment';

import config from '../../config';
import { logger } from '../../config/logger';

import Action from './action';

class EmailReport extends Action {
  constructor(options) {
    super(options);
  }

  run() {
    console.info('Running EmailReport Action');
    console.dir(this.options);

    const requestOptions = _.cloneDeep(config.statengine);
    requestOptions.uri += '/email/timeRangeAnalysis';
    requestOptions.qs = this.options.config_json.schedulerOptions.qs;
    requestOptions.qs.startDate = moment().format('YYYY-MM-DD');
    requestOptions.qs.fireDepartmentId = this.options.fire_department__id;
    requestOptions.json = true;
    requestOptions.method = 'POST';

    console.dir(requestOptions);

    return request(requestOptions);
  }
}

export default EmailReport;
