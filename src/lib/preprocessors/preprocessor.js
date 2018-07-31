/* eslint class-methods-use-this: ["error", { "exceptMethods": ["preprocess"] }] */
class Preprocessor {
  constructor(options = {}) {
    this.options = options;
  }

  preprocess() {
    throw new Error('Not implemented.');
  }
}

export default Preprocessor;
