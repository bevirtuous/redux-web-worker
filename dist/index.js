'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createWorker = require('./createWorker');

Object.keys(_createWorker).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _createWorker[key];
    }
  });
});

var _applyWorker = require('./applyWorker');

Object.keys(_applyWorker).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _applyWorker[key];
    }
  });
});