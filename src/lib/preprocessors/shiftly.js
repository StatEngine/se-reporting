import moment from 'moment-timezone';

import * as shiftly from '@statengine/shiftly';

import { logger } from '../../config/logger';
import Preprocessor from './preprocessor';

// Preprocessor generates a range filter based on todays date
class Shiftly extends Preprocessor {
  preprocess() {
    logger.info('Shiftly Preprocessing');

    let shiftDay;

    if (this.options.current) {
      shiftDay = moment().tz(this.options.timezone);
    } else {
      shiftDay = moment().add(-24, 'hours').tz(this.options.timezone);
    }

    const myShiftly = shiftly[this.options.name]();
    const shiftTimeFrame = myShiftly.shiftTimeFrame(shiftDay);

    const shift = myShiftly.calculateShift(shiftDay);

    return {
      shiftDay,
      shiftTimeFrame,
      display: {
        shift,
        shiftDay: shiftDay.format('YYYY-MM-DD'),
        now: moment.tz(this.options.timezone).format('lll'),
        start: moment(shiftTimeFrame.start).tz(this.options.timezone).format('lll'),
        end: moment(shiftTimeFrame.end).tz(this.options.timezone).format('lll'),
      },
    };
  }
}

export default Shiftly;
