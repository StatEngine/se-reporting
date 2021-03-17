import * as moment from 'moment';
import 'chai/register-should';
import { getScheduler } from '../src/index';

describe('getScheduler', () => {
  it('should schedule 1:05PM UTC to 13 hours, 5 minutes and 0 seconds UTC given DST started and DST department', () => {
    const nonDstDepartment = '01234567890';
    const inDst = true;

    const laterScheduler = getScheduler('at 1:05 pm', nonDstDepartment, inDst);
    const time = laterScheduler.schedules[0].t[0];
    const humanReadableTime = moment.unix(time).utc().format('H [hours,] m [minutes and] s [seconds]');

    humanReadableTime.should.equal('13 hours, 5 minutes and 0 seconds');
  });
  it('should schedule 1:05PM UTC to 14 hours, 5 minutes and 0 seconds UTC given DST ended and DST department', () => {
    const nonDstDepartment = '01234567890';
    const inDst = false;

    const laterScheduler = getScheduler('at 1:05 pm', nonDstDepartment, inDst);
    const time = laterScheduler.schedules[0].t[0];
    const humanReadableTime = moment.unix(time).utc().format('H [hours,] m [minutes and] s [seconds]');

    humanReadableTime.should.equal('14 hours, 5 minutes and 0 seconds');
  });
});

