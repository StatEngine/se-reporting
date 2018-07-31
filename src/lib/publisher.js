import amqp from 'amqplib/callback_api';
import async from 'async';

import config from '../config';

import { logger } from '../config/logger';

let channel;
let connection;

module.exports.startPublisher = (cb) => {
  logger.info('Starting publisher');

  async.series([
    // Open connection
    done => amqp.connect(config.amqp.uri, (err, openConnection) => {
      connection = openConnection;
      done(err);
    }),
    // Open channel
    done => connection.createConfirmChannel((err, openChannel) => {
      channel = openChannel;
      done(err);
    }),
    done => channel.assertQueue('refresh-enrichment-configuration', {}, done),
    done => channel.sendToQueue('refresh-enrichment-configuration', new Buffer('refresh'), {}, done),
  ], (err) => {
    if (err) {
      logger.error(err);
    }

    if (channel) channel.close();
    if (connection) connection.close();

    return cb(err);
  });
};
