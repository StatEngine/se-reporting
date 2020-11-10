import request from 'request-promise';
import later from 'later';
import _ from 'lodash';
import moment from 'moment';

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

// UTC does not account for DST hence the offset between US Eastern and UTC time changes
// from -5hrs to -4 hrs during DST (approx March-Nov)
// Hence, if it is not currently DST, then we need to add an hour offset to the schedule
// since the clock has "fallen back". It is also important to remember that the times/schedules specified
// in the DB configs assume a DST offset.
// e.g.
// Richmond wants emails at approx 8:00 am EST
// Their config specifies approx 12:00 pm UTC
// if DST is being observed this is fine and we don't need to do anything,
// however if DST is NOT observed then the -5hrs offset kicks-in on Nov 1st
// and the email would go out at approx 7 am EST, therefore we add an hour
// to the time to make it go out at 8 am EST as desired.
function subtractAnHour(sched) {
  let time = sched.schedules[0].t[0];
  // later uses seconds, not milliseconds
  time += 3600;
  return [time];
}

function shouldSubtractAnHour(deptId) {
  // array of the departments that do not participate in
  // daylight savings time
  const nonDSTDepartments = [
    '82670', // Golder Ranch, AZ
    '90649', // Northwest AZ
    '93429', // Rincon Vallye, AZ
    '97477', // Tuscon, AZ
  ];

  // if a DST department && it is not currently DST, then we need to offset the time (see comments for subtractAnHour method)
  return (nonDSTDepartments.findIndex(d => d === deptId) === -1 && moment().isDST() === false);
}

function sendDailyEmail(sendTime) {
  console.log(`sendDailyEmail : ${sendTime}`);

  getEmailReportConfiguration()
    .then((periodics) => {
      periodics.forEach((periodic) => {
        if (!_.isNil(periodic.enabled) && periodic.enabled === false) return;
        const periodicConfig = periodic.config_json;
        if (_.get(periodicConfig, 'name') === 'Daily') {
          const sched = later.parse.text(sendTime);
          schedule(periodic._id, sched, 'EmailReport', periodic);
        }
      });
    });
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
          if (shouldSubtractAnHour(deptId)) {
            sched.schedules[0].t = subtractAnHour(sched);
          }
          schedule(periodic._id, sched, 'EmailReport', periodic);
        }
      });
    });
}

// go ahead and run the schedule immediately, and it will handle whatever the current
// state of DST is
scheduleAll();

// when this container starts up, we want to run scheduleAll on the days that daylight
// savings time starts and ends
// daylight savings time starts on the second Sunday of March
const startDstSchedule = later.parse.recur().on(3).month().on(2)
  .weekOfMonth()
  .on(1)
  .hour();
// daylight savings time ends on the first Sunday of November
const endDstSchedule = later.parse.recur().on(11).month().on(1)
  .weekOfMonth()
  .on(1)
  .dayOfWeek()
  .on(1)
  .hour();

// we want to reschedule on start and end of DST
later.setInterval(scheduleAll, startDstSchedule);
later.setInterval(scheduleAll, endDstSchedule);

// these next two lines are ONLY for resending the daily emails if they don't
// go out for some reason
// remember that times are all in UTC
// const emailSendTime = 'at 4:30 pm';
// sendDailyEmail(emailSendTime);
