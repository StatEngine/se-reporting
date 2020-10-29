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
      _id: 'daily',
      enabled: true,
      fire_department__id: '82670',
      config_json: {
        schedulerOptions: {
          later: {
            text: 'at 3:19 pm',
          },
        },
      },
    },
    {
      _id: 'weekly',
      enabled: true,
      fire_department__id: '123',
      config_json: {
        schedulerOptions: {
          later: {
            text: 'on the first day of the week at 3:19 pm',
          },
        },
      },
    },
    {
      _id: 'monthly',
      enabled: true,
      fire_department__id: '82670',
      config_json: {
        schedulerOptions: {
          later: {
            text: 'on the first day of the month at 3:19 pm',
          },
        },
      },
    },
  ];
}

function isDst(deptId) {
  // array of the departments that do not participate in
  // daylight savings time
  const nonDSTDepartments = [
    '82670', // Golder Ranch, AZ
    '90649', // Northwest AZ
    '93429', // Rincon Vallye, AZ
    '97477', // Tuscon, AZ
  ];
  const isDeptDST = nonDSTDepartments.findIndex(d => d === deptId) === -1;

  // may need to set this to just true/false if you want to test specific behavior
  // but your current date is/is not DST
  const isCurrentlyDST = moment().isDST();
  return (isDeptDST && isCurrentlyDST);
}

// if daylight savings time, then
// subtract an hour from the run time
function setTimeDst(sched) {
  let time = sched.schedules[0].t[0];
  // later uses seconds, not miliseconds
  time -= 3600;
  return [time];
}

function scheduleAll() {
  console.log(`SCHEDULE ALL : ${new Date()}`);

  const periodics = getEmailReportConfiguration();
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
}

later.setInterval(scheduleAll, startDstSchedule);
later.setInterval(scheduleAll, endDstSchedule);

