const later = require('later');
const _ = require('lodash');
const moment = require('moment');

// NOTE: UTC is 4 hours ahead of EST
later.date.UTC();

const startDstSchedule = later.parse.recur()
  .on(10) // October
  .month()
  .on(6) // Friday
  .dayOfWeek()
  .on(15) // 3pm UTC, 11am EST
  .hour()
  .on(30) // laterjs minutes are not 0 based - this will trigger at 3:30pm UTC
  .minute();

function getEmailReportConfiguration() {
  return [
    {
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
  console.log(`isDeptDST: ${isDeptDST}`);
  console.log(`isCurrentlyDST: ${isCurrentlyDST}`);

  return (isDeptDST && isCurrentlyDST);
}

// if daylight savings time, then
// subtract an hour from the run time
function setTimeDst(sched) {
  let time = sched.schedules[0].t[0];
  console.log(`Current Schedule Time: ${time}`);
  // later uses seconds, not miliseconds
  time -= 3600;
  console.log(`Updated time: ${time}`);
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
      console.log('sched before DST');
      console.dir(sched.schedules, { depth: null });
      const deptId = periodic.fire_department__id;
      if (isDst(deptId)) {
        // if daylight savings time, then we need to update
        // the schedule time
        console.log('Found a dept that uses DST');
        sched.schedules[0].t = setTimeDst(sched);
      }
      console.log('DST applied if necessary');
      console.dir(sched.schedules, { depth: null });
      // schedule(periodic._id, sched, 'EmailReport', periodic);
    }
  });
}

console.log('START DST');
console.dir(startDstSchedule.schedules, { depth: null });
// console.log('END DST');
// console.dir(endDstSchedule, {depth: null});

later.setInterval(scheduleAll, startDstSchedule);
