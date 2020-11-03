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

// if not currently DST, then we need to subtract
// an hour
function subtractAnHour(sched) {
  let time = sched.schedules[0].t[0];
  // later uses seconds, not miliseconds
  time -= 3600;
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

  // if a DST department && it is not currently DST, then we need to "fall back"
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
          const deptId = periodic.fire_department__id;
          if (shouldSubtractAnHour(deptId)) {
            sched.schedules[0].t = subtractAnHour(sched);
          }
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
// later.setInterval(scheduleAll, startDstSchedule);
// later.setInterval(scheduleAll, endDstSchedule);

// go ahead and run the schedule immediately, and it will handle whatever the current
// state of DST is
// scheduleAll();

// these next two lines are ONLY for resending the daily emails if they don't
// go out for some reason
// set schedulerTime and emailSendTime to whatever time you want, but
// just remember a couple things: emailSendTime should be LATER than schedulerTime
// and the times are in UTC
const schedulerTime = 'at 10:40 pm';
const emailSendTime = 'at 10:45 pm';
const sendDailyEmailSched = later.parse.text(schedulerTime);
later.setTimeout(function() { sendDailyEmail(emailSendTime) }, sendDailyEmailSched);
