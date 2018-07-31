/* eslint class-methods-use-this: ["error", { "exceptMethods": ["notify"] }] */
class Action {
  constructor(fireDepartment, options = {}) {
    this.fireDepartment = fireDepartment;
    this.options = options;
  }

  notify() {
    throw new Error('Not implemented.');
  }
}

export default Action;
