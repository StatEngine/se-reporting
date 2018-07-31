import _ from 'lodash';
import amqp from 'amqplib/callback_api';
import async from 'async';

import config from '../../config';

import Action from './action';

import { logger } from '../../config/logger';

/* eslint class-methods-use-this: ["error", { "exceptMethods": ["notify"] }] */
class Twitter extends Action {
  constructor(fireDepartment, options = {}) {
    super(fireDepartment, options);

    this.fireDepartment = fireDepartment;
    this.options = options;
  }

  notify(payload) {
    const compiled = _.template(this.options.template);

    const tweetVars = {};
    _.forIn(payload.result, (value, key) => {
      tweetVars[key] = value;
    });

    const tweet = {
      fire_department__id: this.fireDepartment._id,
      status: 'PENDING',
      tweet_json: {
        status: compiled(tweetVars),
      },
    };

    Twitter.publish(tweet, () => {});
  }

  static publish(tweet, cb) {
    let connection;
    let channel;

    async.series([
      done => amqp.connect(config.amqp.uri, (err, openConnection) => {
        connection = openConnection;
        done(err);
      }),
      done => connection.createConfirmChannel((err, openChannel) => {
        channel = openChannel;
        done(err);
      }),
      done => channel.assertExchange('dlx.direct', 'direct', null, done),
      done => channel.assertQueue('tweet-recommendation', {}, done),
      done => channel.sendToQueue('tweet-recommendation', new Buffer(JSON.stringify(tweet)), done),
    ], (err) => {
      if (err) {
        logger.error(err);
      }

      if (channel) channel.close();
      if (connection) connection.close();

      cb(err);
    });
  }
}

export default Twitter;
