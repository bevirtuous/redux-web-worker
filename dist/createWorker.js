(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', './ReduxWebWorker'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('./ReduxWebWorker'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.ReduxWebWorker);
    global.createWorker = mod.exports;
  }
})(this, function (exports, _ReduxWebWorker) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _ReduxWebWorker2 = _interopRequireDefault(_ReduxWebWorker);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function createWorker() {
    var worker = new _ReduxWebWorker2.default();

    function messageHandler(event) {
      var action = event.data;

      if (typeof action.type === 'string') {
        if (!worker.reducer || typeof worker.reducer !== 'function') {
          throw new Error('Expect reducer to of type function.');
        }

        var state = worker.state;
        state = worker.state = worker.reducer(state, action);
        state = worker.transform(state);

        self.postMessage({
          type: action.type,
          state: state,
          action: action
        });

        return;
      }

      if (typeof action.task === 'string' && typeof action.taskId === 'number') {
        var taskRunner = worker.tasks.get(action.task);

        if (!taskRunner || typeof taskRunner !== 'function') {
          throw new Error('Cannot find runner for task ' + action.task + '.');
        }

        self.postMessage({
          taskId: action.taskId,
          response: taskRunner(action)
        });
      }
    }

    worker.destroy = function () {
      self.removeEventListener('message', messageHandler);
    };

    self.addEventListener('message', messageHandler);

    return worker;
  }

  exports.default = createWorker;
});