import request from 'request-promise';

import config from '../../config';

import Action from './action';

class SendEmailReport extends Action {
  constructor(options) {
    super(options);
  }

  run() {
    console.info('Running SendEmailReport Action');

    const options = _.deepClone(config.statengine);
    options.uri += '/report/';
    options.json = true;
    options.method = 'POST';

    return request.promise(options);
  }
}

export default SendEmailReport;
