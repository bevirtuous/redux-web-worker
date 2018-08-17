// @flow
import type { Reducer } from 'redux';

/**
 * A custom Worker defintion.
 */
export class ReduxWebWorker {
  reducer: ?Reducer<{}, {}> = null;

  state: {};

  /**
   * @param {Reducer} reducer The original application reducer.
   * @param {Object} [initialState={}] Some initial state object.
   */
  registerReducer(reducer: Reducer<{}, {}>, initialState: {} = {}) {
    this.reducer = reducer;
    this.state = reducer(initialState, {});
  }
}
