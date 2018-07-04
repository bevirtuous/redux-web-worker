(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.applyWorker = mod.exports;
  }
})(this, function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  function defer() {
    var result = {};

    result.promise = new Promise(function (resolve, reject) {
      result.resolve = resolve;
      result.reject = reject;
    });

    return result;
  }

  var applyWorker = function applyWorker(worker) {
    return function (createStore) {
      return function (reducer, initialState, enhancer) {
        if (!(worker instanceof Worker)) {
          console.error('Expect input to be a Web Worker. Fall back to normal store.');
          return createStore(reducer, initialState, enhancer);
        }

        var replacementReducer = function replacementReducer(state, action) {
          if (action.state) {
            return action.state;
          }
          return state;
        };

        var taskId = 0;
        var taskCompleteCallbacks = {};

        var store = createStore(replacementReducer, reducer({}, {}), enhancer);

        var next = store.dispatch;

        store.dispatch = function (action) {
          if (typeof action.type === 'string') {
            if (window.disableWebWorker) {
              return next({
                type: action.type,
                state: reducer(store.getState(), action)
              });
            }
            worker.postMessage(action);
          }

          if (typeof action.task === 'string') {
            var task = Object.assign({}, action, { taskId: taskId });
            var deferred = defer();

            taskCompleteCallbacks[taskId] = deferred;
            taskId += 1;
            worker.postMessage(task);
            return deferred.promise;
          }
        };

        store.isWorker = true;

        worker.addEventListener('message', function (e) {
          var action = e.data;
          if (typeof action.type === 'string') {
            next(action);
          }

          if (typeof action.taskId === 'number') {
            var wrapped = taskCompleteCallbacks[action.taskId];

            if (wrapped) {
              wrapped.resolve(action);
              delete taskCompleteCallbacks[action.taskId];
            }
          }
        });

        return store;
      };
    };
  };

  exports.default = applyWorker;
});