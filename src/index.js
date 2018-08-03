import request from 'request-promise';
import moment from 'moment';
import later from 'later';
import _ from 'lodash';

// schedule everything in UTC
later.date.UTC();

import { FirecaresLookup } from '@statengine/shiftly';

import config from './config';
import { logger } from './config/logger';

import { schedule } from './lib/scheduler/scheduler';

function getFireDepartments() {
  const options = _.deepClone(config.statengine);
  options.uri += '/fire-departments';
  options.json = true;

  return request(options);
}

function getEndOfShiftSchedule(department) {
  const ShiftConfig = FirecaresLookup[department.firecares_id];
  if (!ShiftConfig) {
    logger.warn('No ShiftConfig found.  Not scheduling');
    return;
  }
  const shiftly = new ShiftConfig();

  // Run 5 minutes after every shift
  const startTimeUTC = moment(shiftly.shiftStartDate)
    .utc()
    .add(5, 'minutes');

  const laterText = `at ${startTimeUTC.format('HH:mm')}`;
  logger.info(`Detected ${department.name} end of shift: ${laterText}`);
  return later.parse.text(laterText);
}

getFireDepartments()
  .then(departments => {
    departments.forEach(department => {
      // end of shift report
      let endOfShiftSchedule = getEndOfShiftSchedule(department);
      if (endOfShiftSchedule) {
        let id = `${department.firecares_id}:endOfShiftReport`;
        schedule(id, endOfShiftSchedule, { name: 'EndOfShiftReport', type: 'SendEmailReport', options: { type: 'endOfShift', department }});
      }
    });
  });
