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
    let previous = true;
    if (!_.isNil(this.options.config_json.previous)) previous = this.options.config_json.previous;
    console.info(`previous = ${previous}`);

    requestOptions.uri += '/email/timeRangeAnalysis';

    const nonDSTDepartments = [
      '82670', // Golder Ranch, AZ
      '90649', // Northwest AZ
      '93429', // Rincon Vallye, AZ
      '97477', // Tuscon, AZ
    ];
    const deptId = this.options.fire_department__id;
    let startDate = moment().format();

    // adjust for DST if we need to
    if (nonDSTDepartments.findIndex(d => d === deptId) === -1 && moment().isDST() === false) {
      startDate = moment().add(1, 'hours').format();
    }

    requestOptions.qs = {
      configurationId: this.options._id,
      fireDepartmentId: this.options.fire_department__id,
      startDate,
      previous,
      test: false,
    };
    requestOptions.json = true;
    requestOptions.method = 'POST';

    return request(requestOptions);
  }
}

export default EmailReport;
