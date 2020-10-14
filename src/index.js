import request from 'request-promise';
import later from 'later';
import _ from 'lodash';
import moment from 'moment';

import config from './config';
import timerStore from './timer-store';
import { schedule } from './lib/scheduler/scheduler';

// schedule everything in UTC
later.date.UTC();

function getEmailReportConfiguration() {
  const options = _.cloneDeep(config.statengine);
  options.uri += '/extension-configurations?name=Email Report';
  options.json = true;

  return request(options);
}

// if daylight savings time, then
// subtract an hour from the run time
function setTimeDst(sched) {
  let time = sched.schedules[0].t[0];
  // later uses seconds, not miliseconds
  time = time - 3600;
  return [time];
}

function isDst(deptId) {
  // array of the departments that do not participate in
  // daylight savings time
  const nonDSTDepartments = [
    '82670', // Golder Ranch, AZ
    '90649', // Northwest AZ
    '93429', // Rincon Vallye, AZ
    '97477'  // Tuscon, AZ 
  ];
  
  return (nonDSTDepartments.findIndex(d => d === deptId) === -1 && moment().isDST());
}

function scheduleAll() {
  getEmailReportConfiguration()
    .then((periodics) => {
      periodics.forEach((periodic) => {
        if (!_.isNil(periodic.enabled) && periodic.enabled === false) return;
        const periodicConfig = periodic.config_json;
        if (_.get(periodicConfig, 'schedulerOptions.later.text')) {
          const schedText = periodicConfig.schedulerOptions.later.text;
          const sched = later.parse.text(schedText);
          const deptId = periodic.fire_department__id;
          if (isDst(deptId)) {
            // if daylight savings time, then we need to update
            // the schedule time
            sched.schedules[0].t = setTimeDst(sched);
          }
          schedule(periodic._id, sched, 'EmailReport', periodic);
        }
      });
    });
}

// when this container starts up, we want to run scheduleAll on the days that daylight
// savings time starts and ends
// daylight savings time starts on the second Sunday of March
const startDstSchedule = later.parse.recur().on(3).month().on(2).weekOfMonth().on(1).hour();
// daylight savings time ends on the first Sunday of November
const endDstSchedule = later.parse.recur().on(11).month().on(1).weekOfMonth().on(1).dayOfWeek().on(1).hour();

later.setInterval(scheduleAll, startDstSchedule);
later.setInterval(scheduleAll, endDstSchedule);