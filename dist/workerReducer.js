'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.workerReducer = workerReducer;
function workerReducer(state, action) {
  if (action.workerState) {
    return action.workerState;
  }

  return state;
}