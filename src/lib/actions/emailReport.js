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
    requestOptions.qs = {
      configurationId: this.options._id,
      fireDepartmentId: this.options.fire_department__id,
      startDate: moment().format(),
      previous: true,
    };
    requestOptions.json = true;
    requestOptions.method = 'POST';

    return request(requestOptions);
  }
}

export default EmailReport;
