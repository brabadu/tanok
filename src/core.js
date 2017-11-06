import Rx from 'rx';
import React from 'react';
import ReactDOM from 'react-dom';
import compose from './compose';
import { INIT } from './coreActions';
import Root from './components/root';
import { StreamWrapper, dispatch } from './streamWrapper.js';

export const identity = (value) => value;


export function makeStreamState(
  initialState, update, streamWrapper, middlewares,
) {
  const middlewaresWithStream =  middlewares.map(middleware => middleware(streamWrapper));
  const composedMiddlewares = compose.apply(undefined, middlewaresWithStream);

  let dispatcher = dispatch(streamWrapper.stream, update, null);

  return dispatcher
    .scan((({state}, action) => {
      const appliedMiddleware = composedMiddlewares(action);
      const {state: newState, effects, params} = appliedMiddleware(state);
      return {state: newState, effects, params};
    }), {state: initialState})
    .startWith({state: initialState, effects: []});
}


export function streamWithEffects(stream, streamWrapper) {
    const { Observable, helpers: { isPromise } } = Rx;
    return stream.do(({effects}) =>
        effects.forEach((e) => Observable.spawn(e(streamWrapper))
        .flatMap((obs) => obs instanceof Observable || isPromise(obs) ? obs : [])
        .subscribe(
          Rx.helpers.noop,
          console.error.bind(console)
        ))
      )
}

export function createStore(initialState, update, options) {
  let { outerEventStream, middlewares=[] } = options || {};
  let state = initialState;
  const setState = (newState) => {
    state = { ...newState };
  };
  const getState = () => {
    return state;
  };

  let currentListeners = [];
  let nextListeners = currentListeners;

  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice();
    }
  }

  function subscribe(listener) {
    let isSubscribed = true;

    ensureCanMutateNextListeners();
    nextListeners.push(listener);

    return function unsubscribe() {
      if (!isSubscribed) {
        return
      }

      isSubscribed = false;

      ensureCanMutateNextListeners();
      const index = nextListeners.indexOf(listener);
      nextListeners.splice(index, 1);
    }
  }

  function broadcast() {
    const listeners = currentListeners = nextListeners;
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i];
      listener();
    }
  }

  const eventStream = new Rx.Subject();
  const tanokStream = new StreamWrapper(eventStream, null);
  tanokStream.metadata.push(null);

  const streamState = makeStreamState(
    initialState, update, tanokStream, middlewares,
  )
  .do(({ state }) => setState(state))
  .do(() => broadcast());

  const renderedWithEffects = streamWithEffects(streamState, tanokStream);

  tanokStream.disposable = renderedWithEffects.subscribe(
    Rx.helpers.noop,
    console.error.bind(console)
  );
  tanokStream.send(INIT);

  let outerEventDisposable;
  if (outerEventStream) {
    outerEventDisposable = outerEventStream.subscribe(
      tanokStream.stream.onNext.bind(tanokStream.stream),
      console.error.bind(console)
    )
  }


  return [tanokStream, {
    getState,
    subscribe,
    shutdown: () => {
      tanokStream.onShutdown();
      tanokStream.disposable.dispose();
      outerEventDisposable && outerEventDisposable.dispose();
    },
  }];
}


export function tanok(initialState, update, view, options) {
  let container = options.container;
  if (!container) {
    container = document.createElement('div');
    document.body.appendChild(container);
  }
  const [tanokStream, store] = createStore(initialState, update, options);

  const createdView = React.createElement(view);
  const component = ReactDOM.render(
    <Root store={store} tanokStream={tanokStream}>
      {createdView}
    </Root>,
    container
  );

  return {
    component,
    tanokStream,
    shutdown: () => {
      store.shutdown();
      ReactDOM.unmountComponentAtNode(container);
    },
  };
}
