/* eslint-disable no-restricted-globals */

import ReduxWebWorker from './ReduxWebWorker';

/**
 * Creates a new redux web worker.
 * @return {ReduxWebWorker}
 */
function createWorker() {
  const worker = new ReduxWebWorker();

  /**
   * Handles worker messages.
   * @param {Object} event The worker message event.
   */
  function messageHandler(event) {
    const action = event.data;

    if (typeof action.type === 'string') {
      if (!worker.reducer || typeof worker.reducer !== 'function') {
        throw new Error('Expect reducer to of type function.');
      }

      // Set a new state.
      /* eslint-disable no-multi-assign, prefer-destructuring */
      let state = worker.state;
      state = worker.state = worker.reducer(state, action);
      state = worker.transform(state);
      /* eslint-enable no-multi-assign, prefer-destructuring */

      // Send the new state to the main thread.
      self.postMessage({
        type: action.type,
        state,
        action,
      });

      return;
    }

    if (typeof action.task === 'string' && typeof action.taskId === 'number') {
      const taskRunner = worker.tasks.get(action.task);

      if (!taskRunner || typeof taskRunner !== 'function') {
        throw new Error(`Cannot find runner for task ${action.task}.`);
      }

      self.postMessage({
        taskId: action.taskId,
        response: taskRunner(action),
      });
    }
  }

  worker.destroy = () => {
    self.removeEventListener('message', messageHandler);
  };

  self.addEventListener('message', messageHandler);

  return worker;
}

export default createWorker;
