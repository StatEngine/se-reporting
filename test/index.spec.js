import * as moment from 'moment';
import 'chai/register-should';
import { getScheduler } from '../src/index';

describe('getScheduler', () => {
  const nonDstDepartment = '01234567890';
  const inDst = true;

  it('should schedule 1:05PM to 13 hours, 5 minutes and 0 seconds given DST started and DST department', () => {
    const laterScheduler = getScheduler('at 1:05 pm', nonDstDepartment, inDst);
    const time = laterScheduler.schedules[0].t[0];
    const humanReadableTime = moment.unix(time).utc().format('H [hours,] m [minutes and] s [seconds]');
    humanReadableTime.should.equal('13 hours, 5 minutes and 0 seconds');
  });
});

