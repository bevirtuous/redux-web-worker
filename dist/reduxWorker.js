(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', './createWorker', './applyWorker'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('./createWorker'), require('./applyWorker'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.createWorker, global.applyWorker);
    global.reduxWorker = mod.exports;
  }
})(this, function (exports, _createWorker, _applyWorker) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.createWorker = exports.applyWorker = undefined;

  var _createWorker2 = _interopRequireDefault(_createWorker);

  var _applyWorker2 = _interopRequireDefault(_applyWorker);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  exports.applyWorker = _applyWorker2.default;
  exports.createWorker = _createWorker2.default;
  exports.default = { applyWorker: _applyWorker2.default, createWorker: _createWorker2.default };
});