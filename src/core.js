import Rx from 'rx';
import React from 'react';
import ReactDOM from 'react-dom';
import compose from './compose';
import { INIT } from './coreActions';
import Root from './root';
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

function createStore(initialState, update, middlewares) {
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

  return {
    getState,
    subscribe,
    tanokStream,
    streamState,
  }
}

/**
 * @typedef TanokReturnValue
 * @type { Object }
 * @property { Object } disposable - Returns disposable that can be used for observers disposing.
 * @property { Object } eventStream - Your app inner eventStream.
 * */

/**
 * App-initialization function.
 * @param { Object } initialState - Initial state of your application.
 * @param { Array } update - Array of pairs "predicate - state mutator",
 * declarative statement of your events dispatching. Usually - result of dispatcher.collect() invocation.
 * @param { class } view - Your root component class.
 * @param { Object } options - Advanced app configuration
 * @param { HTMLElement } options.container - Root node of your application.
 * If not provided - new "div" will be added and appended to document.body .
 * @param { Object } options.outerEventStream - Yet another stream that will be merged to your app inner stream.
 * @param { Function } options.stateSerializer - Advanced function to serialize your model before passing to view as props.
 * @param { Array } options.middlewares - List of middlewares.
 * @returns { TanokReturnValue } - Returns disposable as result of your observers applying,
 * and your app inner eventStream.
 * */
export function tanok(initialState, update, view, options) {
  let { container, outerEventStream, middlewares=[] } = options || {};
  if (!container) {
    container = document.createElement('div');
    document.body.appendChild(container);
  }
  const tmpStore = createStore(initialState, update, middlewares);
  const {streamState, tanokStream} = tmpStore;
  const store = {
    getState: tmpStore.getState,
    subscribe: tmpStore.subscribe,
  }

  const renderedWithEffects = streamWithEffects(streamState, tanokStream);

  tanokStream.disposable = renderedWithEffects.subscribe(
    Rx.helpers.noop,
    console.error.bind(console)
  );

  tanokStream.send(INIT);
  const createdView = React.createElement(view);
  const component = ReactDOM.render(
    <Root store={store} tanokStream={tanokStream}>
      {createdView}
    </Root>,
    container
  );

  let outerEventDisposable;
  if (outerEventStream) {
    outerEventDisposable = outerEventStream.subscribe(
      tanokStream.stream.onNext.bind(tanokStream.stream),
      console.error.bind(console)
    )
  }

  return {
    disposable: tanokStream.disposable,
    streamWrapper: tanokStream,
    shutdown: () => {
      tanokStream.onShutdown();
      tanokStream.disposable.dispose();
      outerEventDisposable && outerEventDisposable.dispose();
      ReactDOM.unmountComponentAtNode(container);
    },
    eventStream: tanokStream.stream,
    component,
  };
}
