/**
 * The main web worker class.
 */
class ReduxWebWorker {
  /**
   * Constructor.
   */
  constructor() {
    // The task runners.
    this.tasks = new Map();

    this.state = {};
    this.reducer = null;
    this.transform = state => state;
  }

  /**
   * Registers a new redux reducer.
   * @param {Function} reducer The redux reducer.
   */
  registerReducer(reducer) {
    this.reducer = reducer;
    this.state = reducer({}, {});
  }

  /**
   * Registers a new reducer task.
   * @param {string} name The task name.
   * @param {Function} taskFn The task function.
   */
  registerTask(name, taskFn) {
    if (!this.tasks.has(name)) {
      this.tasks.set(name, taskFn);
    }
  }
}

export default ReduxWebWorker;
