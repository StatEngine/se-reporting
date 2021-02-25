import request from 'request-promise';
import _ from 'lodash';

import config from '../../config';
import Action from './action';

class CustomEmail extends Action {
  constructor(options) {
    super(options);
  }

  run() {
    console.log('CustomEmail Action');
    const requestOptions = _.cloneDeep(config.statengine);
    requestOptions.uri += '/email/customEmail';
    requestOptions.body = this.options;
    requestOptions.qs = {
      configurationId: this.options._id,
      fireDepartmentId: this.options.fd_id,
    };
    requestOptions.json = true;
    requestOptions.method = 'POST';

    return request(requestOptions);
  }
}

export default CustomEmail;
