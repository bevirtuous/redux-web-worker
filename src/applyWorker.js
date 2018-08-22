// @flow
import { logger } from './logger';
import { replacementReducer } from './replacementReducer';
import type {
  Action, Reducer, Enhancer, CreateStore,
} from '../types';

type State = {};

/**
 * @param {Worker} worker A Web Worker instance.
 * @return {Function}
 */
function applyWorker(worker: Worker) {
  return (createStore: CreateStore) => (
    (reducer: Reducer, initialState?: State, enhancer: Enhancer) => {
      if (!(worker instanceof Worker)) {
        logger.error('Expected input to be a Web Worker. Falling back to default store.');
        return createStore(reducer, initialState, enhancer);
      }

      // Create store using new reducer
      const store = createStore(replacementReducer, reducer({}, { type: '' }), enhancer);
      // Store reference of old dispatcher
      const next = store.dispatch;

      // Replace dispatcher
      store.dispatch = (action: Action) => {
        if (window.disableWebWorker) {
          next({
            type: action.type,
            state: reducer(store.getState(), action),
          });

          return;
        }

        worker.postMessage(action);
      };

      // Add worker events listener
      worker.addEventListener('message', ({ data }: MessageEvent) => {
        next({ ...data });
      });

      worker.addEventListener('error', (error: Error) => {
        logger.error('Error received from Web Worker:', error);
      });

      return store;
    }
  );
}

export default applyWorker;
