import request from 'request-promise';
import later from 'later';
import _ from 'lodash';

import config from './config';
import { schedule } from './lib/scheduler/scheduler';

// schedule everything in UTC
later.date.UTC();

function getEmailReportConfiguration() {
  const options = _.cloneDeep(config.statengine);
  options.uri += '/extension-configurations?name=Email Report';
  options.json = true;

  return request(options);
}

getEmailReportConfiguration()
  .then((periodics) => {
    periodics.forEach((periodic) => {
      if (!_.isNil(periodic.enabled) && periodic.enabled === false) return;

      const periodicConfig = periodic.config_json;
      if (_.get(periodicConfig, 'schedulerOptions.later.text')) {
        const sched = later.parse.text(periodicConfig.schedulerOptions.later.text);

        schedule(periodic._id, sched, 'EmailReport', periodic);
      }
    });
  });
