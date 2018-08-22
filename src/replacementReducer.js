// @flow
import type { Action, Reducer, State } from '../types';

/**
 * @param {State} state The current state.
 * @param {Action} action The redux action possibly holding the mutated state.
 * @return {Object}
 */
export const replacementReducer: Reducer = (state: State, action: Action): State => {
  if (action.state) {
    return action.state;
  }

  return state;
};
