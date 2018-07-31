import config from './config';

import { logger } from './config/logger';

import { startConsumer } from './lib/consumer';
import { startPublisher } from './lib/publisher';

startConsumer((consumerErr) => {
  if (consumerErr) process.exit(1);

  setTimeout(() => startPublisher((publisherErr) => {
    if (publisherErr) process.exit(1);

    logger.info('Process up and running!');
  }), config.startup.delay);
});
