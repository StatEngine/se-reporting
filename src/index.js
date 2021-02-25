/* eslint-disable no-console */
import request from 'request-promise';
import later from 'later';
import _ from 'lodash';
import moment from 'moment';

import config from './config';
import { schedule } from './lib/scheduler/scheduler';

// schedule everything in UTC
later.date.UTC();

/**
 * does GET requests to the webapp api for email configs
 * @param {string} path this is the path that gets appended to the baseUrl
 */
async function getEnabledEmailConfigs(path) {
  const options = _.cloneDeep(config.statengine);
  options.uri += path;
  options.json = true;
  const emailConfigs = await request(options);
  return emailConfigs.filter(emailConfig => emailConfig.enabled);
}

/**
 * retrieve the notification email configs from the webapp api
 */
function getNotificationEmailConfigs() {
  return getEnabledEmailConfigs('/extension-configurations?name=Email Report');
}

/**
 * retrieve the custom email configs from the webapp api.
 */
function getCustomEmailConfigs() {
  return getEnabledEmailConfigs('/custom-email');
}

// UTC does not account for DST hence the offset between US Eastern and UTC time changes
// from -5hrs to -4 hrs during DST (approx March-Nov)
// Hence, if it is not currently DST, then we need to add an hour offset to the schedule
// since the clock has "fallen back". It is also important to remember that the times/schedules
// specified in the DB configs assume a DST offset.
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

  /**
   * if a DST department && it is not currently DST, then we need to offset the time
   * (see comments for subtractAnHour method)
   */
  return (nonDSTDepartments.findIndex(d => d === deptId) === -1 && moment().isDST() === false);
}

/**
 * creates a schedule using laterjs. accounts for daylight savings time
 * @param {string} schedText this is a string that laterjs will parse into a schedule
 * @param {string} deptId this is the fd_id of the fire department that owns the email
 */
function getScheduleWithDST(schedText, deptId) {
  const sched = later.parse.text(schedText);
  if (shouldSubtractAnHour(deptId)) {
    sched.schedules[0].t = subtractAnHour(sched);
  }
  return sched;
}

/**
 * handles scheduling of the standard notification emails
 * @param {*} emailConfig the email options object. these are stored in the
 * db in table ExtensionConfigurations.
 * see the se-sql-seed repo for each department's options
 */
function scheduleNotificationEmail(emailConfig) {
  const periodicConfig = emailConfig.config_json;
  if (_.get(periodicConfig, 'schedulerOptions.later.text')) {
    const schedText = periodicConfig.schedulerOptions.later.text;
    const deptId = emailConfig.fire_department__id;
    const sched = getScheduleWithDST(schedText, deptId);
    schedule(emailConfig._id, sched, 'EmailReport', emailConfig);
  }
}

/**
 * handles scheduling of the custom emails that are created by the users of the webapp
 * @param {*} emailConfig the email options object. these are stored in the db in table CustomEmails
 */
function scheduleCustomEmail(emailConfig) {
  const { __id: configId, fd_id: deptId, schedule: schedText } = emailConfig;
  const sched = getScheduleWithDST(schedText, deptId);
  schedule(configId, sched, 'CustomEmail', emailConfig);
}

/**
 * this handles scheduling all emails
 */
async function scheduleAll() {
  const notificationEmailConfigs = await getNotificationEmailConfigs()
    .catch((err) => {
      console.log('ERROR: getEmailReportConfiguration');
      console.dir(err);
    });
  notificationEmailConfigs.forEach((emailConfig) => {
    scheduleNotificationEmail(emailConfig);
  });

  // this handles scheduling the custom emails
  const customEmailConfigs = await getCustomEmailConfigs()
    .catch((err) => {
      console.log('ERROR: getEmailReportConfiguration');
      console.dir(err);
    });

  customEmailConfigs.forEach((emailConfig) => {
    scheduleCustomEmail(emailConfig);
  });
}

// go ahead and run scheduleAll immediately, and it will handle whatever the current
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
