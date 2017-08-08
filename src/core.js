import Rx from 'rx';
import React from 'react';
import ReactDOM from 'react-dom';
import compose from './compose';
import { StreamWrapper, dispatch } from './streamWrapper.js';

export const identity = (value) => value;

class Root extends React.Component {
  constructor(props) {
    super(props);
    this.state = props;
  }

  render() {
    return React.createElement(
      this.props.view,
      this.state
    )
  }
}

export function makeStreamState(initialState, update, eventStream, middlewares) {
  let dispatcher = dispatch(eventStream, update, null);

  const composedMiddlewares = compose.apply(undefined, middlewares);

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
  let { container, outerEventStream, stateSerializer = identity, middlewares=[] } = options || {};
  if (!container) {
    container = document.createElement('div');
    document.body.appendChild(container);
  }

  const eventStream = new Rx.Subject();
  const streamWrapper = new StreamWrapper(eventStream, null);
  streamWrapper.metadata.push(null);

  const streamState = makeStreamState(initialState, update, eventStream, middlewares);

  let component;
  const renderedStream = streamState.do(
    ({state}) => component && component.setState(stateSerializer(state))
  );
  const renderedWithEffects = streamWithEffects(renderedStream, streamWrapper);

  streamWrapper.disposable = renderedWithEffects.subscribe(
    Rx.helpers.noop,
    console.error.bind(console)
  );

  streamWrapper.send('init');

  component = ReactDOM.render(
    React.createElement(
      Root,
      Object.assign({
          view,
          tanokStream: streamWrapper,
          eventStream: streamWrapper,
        },
        stateSerializer(initialState)
      )
    ),
    container
  )

  if (outerEventStream) {
    const outerEventDisposable = outerEventStream.subscribe(
      streamWrapper.stream.onNext.bind(streamWrapper.stream),
      console.error.bind(console)
    )
  }

  return {
    disposable: streamWrapper.disposable,
    streamWrapper,
    shutdown: () => {
        streamWrapper.disposable.dispose();
        outerEventDisposable && outerEventDisposable.dispose();
        ReactDOM.unmountComponentAtNode(container);
    },
    eventStream,
    component,
  };
}
