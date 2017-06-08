import Rx from 'rx';
import React from 'react';
import createReactClass from 'create-react-class';
import ReactDOM from 'react-dom';
import compose from './compose';
import { StreamWrapper, dispatch } from './streamWrapper.js';

const identity = (value) => value;

const Root = createReactClass({
  getInitialState() {
    return this.props;
  },

  render() {
    return React.createElement(
      this.props.view,
      this.state
    )
  }
});


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
  const rootName = null;
  let dispatcher = dispatch(eventStream, update, rootName);
  const streamWrapper = new StreamWrapper(eventStream, rootName);
  streamWrapper.metadata.push(null);

  const effectsBus = new Rx.Subject();
  effectsBus
    .flatMap((obj) => obj(streamWrapper, effectsBus) || [])
    .subscribe(
      Rx.helpers.noop,
      console.error.bind(console)
    );

  let component;
  const composedMiddlewares = compose.apply(undefined, middlewares);

  dispatcher = dispatcher
    .scan((({state}, action) => {
      const appliedMiddleware = composedMiddlewares(action);
      const {state: newState, effects, params: params} = appliedMiddleware(state);
      return {state: newState, effects, params: params}
    }), {state: initialState})
    .startWith({state: initialState});


  streamWrapper.disposable = dispatcher
    .do(({state}) => component && component.setState(stateSerializer(state)))
    .do(({effects=[]}) =>
      effects.forEach((e) => effectsBus.onNext(e))
    )
    .subscribe(
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
    outerEventStream.subscribe(
      streamWrapper.stream.onNext.bind(streamWrapper.stream),
      console.error.bind(console)
    )
  }

  return {
    disposable: streamWrapper.disposable,
    eventStream,
    component,
  };
}
