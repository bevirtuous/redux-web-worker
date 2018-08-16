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
    global.createWorker = mod.exports;
  }
})(this, function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var createWorker = function createWorker(reducer) {
    var worker = new ReduxWorker();

    var messageHandler = function messageHandler(e) {
      var action = e.data;

      if (typeof action.type === 'string') {
        if (!worker.reducer || typeof worker.reducer !== 'function') {
          throw new Error('Expect reducer to be function. Have you registerReducer yet?');
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

      if (typeof action.task === 'string' && typeof action._taskId === 'number') {
        var taskRunner = worker.tasks[action.task];

        if (!taskRunner || typeof taskRunner !== 'function') {
          throw new Error('Cannot find runner for task ' + action.task + '. Have you registerTask yet?');
        }

        self.postMessage({
          _taskId: action._taskId,
          response: taskRunner(action)
        });
      }
    };

    worker.destroy = function () {
      self.removeEventListener('message', messageHandler);
    };

    self.addEventListener('message', messageHandler);

    return worker;
  };

  var ReduxWorker = function () {
    function ReduxWorker() {
      _classCallCheck(this, ReduxWorker);

      this.tasks = {};

      this.state = {};
      this.reducer = null;
      this.transform = function (state) {
        return state;
      };
    }

    _createClass(ReduxWorker, [{
      key: 'registerReducer',
      value: function registerReducer(reducer, transform) {
        this.reducer = reducer;
        this.state = reducer({}, {});
      }
    }, {
      key: 'registerTask',
      value: function registerTask(name, taskFn) {
        this.tasks[name] = taskFn;
      }
    }]);

    return ReduxWorker;
  }();

  exports.default = createWorker;
});