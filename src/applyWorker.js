const defer = function () {
  const result = {};
  result.promise = new Promise(((resolve, reject) => {
    result.resolve = resolve;
    result.reject = reject;
  }));
  return result;
};

const applyWorker = worker => createStore => (reducer, initialState, enhancer) => {
  if (!(worker instanceof Worker)) {
    console.error('Expect input to be a Web Worker. Fall back to normal store.');
    return createStore(reducer, initialState, enhancer);
  }

  // New reducer for workified store
  const replacementReducer = (state, action) => {
    if (action.state) {
      return Object.assign(state, action.state);
    }
    return state;
  };

  // Start task id;
  let taskId = 0;
  const taskCompleteCallbacks = {};

  // Create store using new reducer
  const store = createStore(replacementReducer, initialState, enhancer);

  // Store reference of old dispatcher
  const next = store.dispatch;

  // Replace dispatcher
  store.dispatch = (action) => {
    if (typeof action.type === 'string') {
      if (window.disableWebWorker) {
        return next({
          type: action.type,
          state: reducer(store.getState(), action),
        });
      }
      worker.postMessage(action);
    }

    if (typeof action.task === 'string') {
      const task = Object.assign({}, action, { _taskId: taskId });
      const deferred = defer();

      taskCompleteCallbacks[taskId] = deferred;
      taskId++;
      worker.postMessage(task);
      return deferred.promise;
    }
  };

  store.isWorker = true;

  // Add worker events listener
  worker.addEventListener('message', (e) => {
    const action = e.data;
    if (typeof action.type === 'string') {
      next(action);
    }

    if (typeof action._taskId === 'number') {
      const wrapped = taskCompleteCallbacks[action._taskId];

      if (wrapped) {
        wrapped.resolve(action);
        delete taskCompleteCallbacks[action._taskId];
      }
    }
  });

  return store;
};

export default applyWorker;
