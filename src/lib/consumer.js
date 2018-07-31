import amqp from 'amqplib/callback_api';
import async from 'async';

import config from '../config';

import { logger } from '../config/logger';
import { schedule } from './scheduler/scheduler';

let channel;
let connection;
let queue;

module.exports.startConsumer = (cb) => {
  logger.info('Starting consumer');

  async.series([
    // Open connection
    done => amqp.connect(config.amqp.uri, (err, openConnection) => {
      connection = openConnection;
      done(err);
    }),
    // Open channel
    done => connection.createChannel((err, openChannel) => {
      channel = openChannel;
      done(err);
    }),
    // Assert exchange and queue
    done => channel.assertExchange('enrichment-configuration', 'fanout', { durable: false }, done),
    done => channel.assertQueue('se-reporting-engine', {}, (err, openQueue) => {
      queue = openQueue;
      done(err);
    }),
  ], (err) => {
    if (err) {
      logger.error(err);
      return cb(err);
    }

    channel.bindQueue(queue.queue, 'enrichment-configuration', '');
    channel.consume(queue.queue, (msg) => {
      const ext = JSON.parse(msg.content.toString());

      logger.info(ext);

      if (ext.Extension.type === 'PERIODIC') schedule(ext);

      channel.ack(msg);
    });

    return cb();
  });
};
