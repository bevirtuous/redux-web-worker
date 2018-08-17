'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createWorker = createWorker;

var _ReduxWebWorker = require('./ReduxWebWorker');

function createWorker() {
  var worker = new _ReduxWebWorker.ReduxWebWorker();

  self.addEventListener('message', function (_ref) {
    var data = _ref.data;

    var action = JSON.parse(data);

    if (!worker.reducer || typeof worker.reducer !== 'function') {
      throw new Error('Expect reducer to be function. Have you registerReducer yet?');
    }

    var workerState = worker.reducer(worker.state, action);

    self.postMessage(JSON.stringify({
      type: action.type,
      workerState: workerState,
      action: action
    }));
  });

  return worker;
}