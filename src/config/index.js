process.env.NODE_ENV = process.env.NODE_ENV || 'development';

process.env.AMQP_PROTOCOL = process.env.AMQP_PROTOCOL || 'amqp';
process.env.AMQP_HOST = process.env.AMQP_HOST || 'localhost';
process.env.AMQP_PORT = process.env.AMQP_PORT || 5672;
process.env.AMQP_USER = process.env.AMQP_USER || 'guest';
process.env.AMQP_PASSWORD = process.env.AMQP_PASSWORD || 'guest';

export default {
  environment: process.env.NODE_ENV,
  statengine: {
    uri: process.env.STATENGINE_API_URI || 'http://localhost:3000/api',
    auth: {
      username: process.env.STATENGINE_SVC_ACCOUNT_USER || 'svcAccount',
      password: process.env.STATENGINE_SVC_ACCOUNT_PASSWORD || 'password',
    },
  },
};
