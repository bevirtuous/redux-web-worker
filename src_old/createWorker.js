const createWorker = (reducer) => {
  // Initialize ReduxWorekr
  const worker = new ReduxWorker();

  const messageHandler = (e) => {
    const action = e.data;

    if (typeof action.type === 'string') {
      if (!worker.reducer || typeof worker.reducer !== 'function') {
        throw new Error('Expect reducer to be function. Have you registerReducer yet?');
      }

      // Set new state
      let state = worker.state;
      state = worker.state = worker.reducer(state, action);
      state = worker.transform(state);

      // Send new state to main thread
      self.postMessage({
        type: action.type,
        state,
        action,
      });

      return;
    }

    if (typeof action.task === 'string' && typeof action._taskId === 'number') {
      const taskRunner = worker.tasks[action.task];

      if (!taskRunner || typeof taskRunner !== 'function') {
        throw new Error(`Cannot find runner for task ${action.task}.`);
      }

      // Send new state to main thread
      self.postMessage({
        _taskId: action._taskId,
        response: taskRunner(action),
      });
    }
  };

  worker.destroy = () => {
    self.removeEventListener('message', messageHandler);
  };

  self.addEventListener('message', messageHandler);


  return worker;
};

class ReduxWorker {
  constructor() {
    // Taskrunners
    this.tasks = {};

    // Redux-specific variables
    this.state = {};
    this.reducer = null;
    this.transform = state => state;
  }

  registerReducer(reducer) {
    this.reducer = reducer;
    this.state = reducer({}, {});
  }

  registerTask(name, taskFn) {
    this.tasks[name] = taskFn;
  }
}

export default createWorker;
