'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.applyWorker = applyWorker;

var _logger = require('./logger');

var _workerReducer = require('./workerReducer');

function applyWorker(worker) {
  return function handleCreateStore(createStore) {
    return function (reducer, initialState, enhancer) {
      if (!(worker instanceof Worker)) {
        _logger.logger.error('Expect input to be a Web Worker. Fall back to normal store.');
        return createStore(reducer, initialState, enhancer);
      }

      var store = createStore(_workerReducer.workerReducer, initialState, enhancer);
      var next = store.dispatch;

      store.dispatch = function (action) {
        if (!window.Worker || window.disableWebWorker) {
          next({
            type: action.type,
            workerState: reducer(store.getState(), action)
          });

          return;
        }

        worker.postMessage(JSON.stringify(action));
      };

      worker.addEventListener('message', function (_ref) {
        var data = _ref.data;

        next(data);
      });

      return store;
    };
  };
}