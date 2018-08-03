process.env.NODE_ENV = process.env.NODE_ENV || 'development';

process.env.AMQP_PROTOCOL = process.env.AMQP_PROTOCOL || 'amqp';
process.env.AMQP_HOST = process.env.AMQP_HOST || 'localhost';
process.env.AMQP_PORT = process.env.AMQP_PORT || 5672;
process.env.AMQP_USER = process.env.AMQP_USER || 'guest';
process.env.AMQP_PASSWORD = process.env.AMQP_PASSWORD || 'guest';

export default {
  startup: {
    delay: process.env.STARTUP_DELAY || 120000,
  },
  environment: process.env.NODE_ENV,
  amqp: {
    uri: `${process.env.AMQP_PROTOCOL}://${process.env.AMQP_USER}:${process.env.AMQP_PASSWORD}@${process.env.AMQP_HOST}:${process.env.AMQP_PORT}`,
  },
  elasticsearch: {
    host: process.env.ELASTICSEARCH_URI || 'localhost:9200',
    httpAuth: (process.env.ELASTICSEARCH_USER && process.env.ELASTICSEARCH_PASSWORD) ? `${process.env.ELASTICSEARCH_USER}:${process.env.ELASTICSEARCH_PASSWORD}` : undefined,
    apiVersion: process.env.ELASTICSEARCH_API_VERSION || '5.5',
  },
  statengine: {
    uri: process.env.STATENGINE_URI || 'http://localhost:3000/api',
    auth: {
      username: process.env.STATENGINE_SVC_ACCOUNT_USER || 'srvAccount',
      password: process.env.STATENGINE_SVC_ACCOUNT_PASSWORD || 'password'
    }
  },
  email: {
    mandrill: {
      auth: {
        apiKey: process.env.MANDRILL_API_KEY,
      },
    },
  },
  mapbox: {
    api_key: process.env.MAPBOX_API_KEY,
  },
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.example.com',
    port: process.env.SMTP_PORT || 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER || 'username',
      pass: process.env.SMTP_PASSWORD || 'password',
    },
    requireTLS: true,
  },
};
