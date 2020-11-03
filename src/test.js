import later from 'later';
import _ from 'lodash';
import moment from 'moment';

import { schedule } from './lib/scheduler/scheduler';

// NOTE: UTC is 4 hours ahead of EST
later.date.UTC();

const startMonth = 10;
const startWeekOfMonth = 4;
const startDayOfWeek = 2;
const startHour = 18;
const startMinute = 31;

const startDstSchedule = later.parse.recur()
  .on(startMonth)
  .month()
  .on(startWeekOfMonth)
  .weekOfMonth()
  .on(startDayOfWeek)
  .dayOfWeek()
  .on(startHour)
  .hour()
  .on(startMinute) // laterjs minutes are not 0 based
  .minute();

const endDstSchedule = later.parse.recur()
  .on(startMonth)
  .month()
  .on(startWeekOfMonth)
  .weekOfMonth()
  .on(startDayOfWeek)
  .dayOfWeek()
  .on(startHour)
  .hour()
  .on(startMinute + 1) // laterjs minutes are not 0 based
  .minute();

function getEmailReportConfiguration() {
  return [
    {
      _id: 'daily123',
      enabled: true,
      fire_department__id: '82670',
      config_json: {
        name: 'Daily',
        schedulerOptions: {
          later: {
            text: 'at 3:19 pm',
          },
        },
      },
    },
    {
      _id: 'weekly456',
      enabled: true,
      fire_department__id: '123',
      config_json: {
        name: 'Weekly',
        schedulerOptions: {
          later: {
            text: 'on the first day of the week at 3:19 pm',
          },
        },
      },
    },
    {
      _id: 'monthly789',
      enabled: true,
      fire_department__id: '82670',
      config_json: {
        name: 'Monthly',
        schedulerOptions: {
          later: {
            text: 'on the first day of the month at 3:19 pm',
          },
        },
      },
    },
  ];
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

  // if a DST department && it is not currently DST - we need to "fall back"
  return (nonDSTDepartments.findIndex(d => d === deptId) === -1 && moment().isDST() === false);
}

function scheduleAll(schedText) {
  console.log(schedText);

  const periodics = getEmailReportConfiguration();
  periodics.forEach((periodic) => {
    if (!_.isNil(periodic.enabled) && periodic.enabled === false) return;
    const periodicConfig = periodic.config_json;
    if (_.get(periodicConfig, 'name') === 'Daily') {
      console.log(`found a daily with id: ${periodic._id}`);

      // const schedText = periodicConfig.schedulerOptions.later.text;
      const sched = later.parse.text(schedText);
      // const deptId = periodic.fire_department__id;
      // if (shouldSubtractAnHour(deptId)) {
      //   // if daylight savings time, then we need to update
      //   // the schedule time
      //   sched.schedules[0].t = subtractAnHour(sched);
      // }
      schedule(periodic._id, sched, 'TestAction', periodic);
    }
  });
}

const schedulerTime = 'at 9:32 pm';
const emailSendTime = 'at 9:33 pm';
const sendDailyEmailSched = later.parse.text(schedulerTime);
later.setTimeout(function() { scheduleAll(emailSendTime) }, sendDailyEmailSched);
// console.log(`IS DST: ${moment().isDST()}`);
// later.setInterval(scheduleAll, startDstSchedule);
// later.setInterval(scheduleAll, endDstSchedule);

