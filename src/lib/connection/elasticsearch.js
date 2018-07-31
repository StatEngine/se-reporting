import elasticsearch from 'elasticsearch';
import config from '../../config/';

class Connection {
  constructor() {
    this.client = new elasticsearch.Client(config.elasticsearch);
  }

  getClient() {
    return this.client;
  }
}

export default new Connection();
