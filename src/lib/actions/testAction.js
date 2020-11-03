
import Action from './action';

class TestAction extends Action {
  constructor(options) {
    super(options);
  }

  run() {
    console.info('Running TestAction Action');
    console.dir(this.options);
  }
}

export default TestAction;
