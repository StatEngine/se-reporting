import moment from 'moment-timezone';


import { logger } from '../../config/logger';
import Preprocessor from './preprocessor';

// Preprocessor generates a range filter based on todays date
class Daily extends Preprocessor {
  preprocess() {
    logger.info('Daily Preprocessing');

    return {
      timeFrame: {
        start: moment.tz(this.options.timezone).subtract(1, 'day').format(),
        end: moment.tz(this.options.timezone).format(),
      },
    };
  }
}

export default Daily;
