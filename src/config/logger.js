import bunyan from 'bunyan';

export const logger = bunyan.createLogger({ name: 'se-reporting-engine' });

export default { logger };
