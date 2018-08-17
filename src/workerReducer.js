// @flow
import type { Action } from '../types';

/**
 * @param {Object} state The current application state.
 * @param {Object} action The current redux action.
 * @return {Object}
 */
export function workerReducer(state: {}, action: Action): {} {
  if (action.workerState) {
    return action.workerState;
  }

  return state;
}
