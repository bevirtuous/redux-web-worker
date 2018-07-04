/**
 * @return {Object}
 */
function defer() {
  const result = {};

  result.promise = new Promise(((resolve, reject) => {
    result.resolve = resolve;
    result.reject = reject;
  }));

  return result;
}

/**
 * @param {Object} state The main state.
 * @param {Object} action The action including workified state.
 * @return {Object}
 */
function replacementReducer(state, action) {
  if (action.state) {
    return action.state;
  }

  return state;
}

/**
 * Applies the ReduxWebWorker to the redux store.
 * @param {ReduxWebWorker} worker An instance of ReduxWebWorker.
 * @return {Function}
 */
function applyWorker(worker) {
  return createStore => (reducer, initialState, enhancer) => {
    if (!(worker instanceof Worker)) {
      console.error('Expect input to be a Web Worker. Fall back to normal store.');
      return createStore(reducer, initialState, enhancer);
    }

    // Start task id;
    let taskId = 0;
    const taskCompleteCallbacks = {};

    // Create store using new reducer
    const store = createStore(replacementReducer, reducer({}, {}), enhancer);

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
        const task = Object.assign({}, action, { taskId });
        const deferred = defer();

        taskCompleteCallbacks[taskId] = deferred;
        taskId += 1;
        worker.postMessage(task);
        return deferred.promise;
      }
    };

    store.isWorker = true;

    // Add worker events listener
    worker.addEventListener('message', (event) => {
      const action = event.data;

      if (typeof action.type === 'string') {
        next(action);
      }

      if (typeof action.taskId === 'number') {
        const wrapped = taskCompleteCallbacks[action.taskId];

        if (wrapped) {
          wrapped.resolve(action);
          delete taskCompleteCallbacks[action.taskId];
        }
      }
    });

    return store;
  };
}

export default applyWorker;
