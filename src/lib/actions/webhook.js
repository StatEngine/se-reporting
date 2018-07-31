import request from 'request-promise';
import _ from 'lodash';

import Action from './action';

/* eslint class-methods-use-this: ["error", { "exceptMethods": ["notify"] }] */
class Webhook extends Action {
  constructor(options = {}) {
    super(options);

    this.options = options;

    this.options = _.assign({
      method: 'POST',
      json: true,
    });
  }

  notify(params) {
    return request(params);
  }
}

export default Webhook;
