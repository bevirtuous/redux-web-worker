// @flow
/* eslint-disable no-restricted-globals */
import type { Action } from '../types';
import { ReduxWebWorker } from './ReduxWebWorker';

/**
 * @param {Reducer} reducer The original reducer.
 * @returns {Worker}
 */
export function createWorker() {
  const worker: ReduxWebWorker = new ReduxWebWorker();

  // This is happening inside the Worker.
  self.addEventListener('message', ({ data }) => {
    const action: Action = JSON.parse(data);

    if (!worker.reducer || typeof worker.reducer !== 'function') {
      throw new Error('Expect reducer to be function. Have you registerReducer yet?');
    }

    // This is the actual redux logic happening in the worker.
    const workerState = worker.reducer(worker.state, action);

    // Sending everything back to the main thread.
    self.postMessage(JSON.stringify({
      type: action.type,
      workerState,
      action,
    }));
  });

  return worker;
}
