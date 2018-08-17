// @flow
import type { Reducer, StoreEnhancer } from 'redux';
import { logger } from './logger';
import { workerReducer } from './workerReducer';
import type { Action } from '../types';

/**
 * @param {Worker} worker The Worker instance to apply to the redux store.
 * @return {Function}
 */
export function applyWorker(worker: Worker) {
  return function handleCreateStore(createStore) {
    return (reducer: Reducer<{}, {}>, initialState: {}, enhancer: StoreEnhancer<{}, {}>) => {
      if (!(worker instanceof Worker)) {
        logger.error('Expect input to be a Web Worker. Fall back to normal store.');
        return createStore(reducer, initialState, enhancer);
      }

      const store = createStore(workerReducer, initialState, enhancer);
      const next = store.dispatch;

      /**
       * Replace the default dispatch to handle worker postMessages instead.
       * @param {Object} action The worker redux action.
       */
      store.dispatch = (action: Action) => {
        // If Worker is not available just send out the current state.
        if (!window.Worker || window.disableWebWorker) {
          next({
            type: action.type,
            workerState: reducer(store.getState(), action),
          });

          return;
        }

        worker.postMessage(JSON.stringify(action));
      };

      worker.addEventListener('message', ({ data }: MessageEvent) => {
        next(data);
      });

      return store;
    };
  };
}
