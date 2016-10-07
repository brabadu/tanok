import Rx from 'rx';
import React from 'react';
import ReactDOM from 'react-dom';
import { StreamWrapper, dispatch } from './streamWrapper.js';

const identity = (value) => value;

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
  const rootParent = null;
  let dispatcher = dispatch(eventStream, update, rootParent);
  const streamWrapper = new StreamWrapper(eventStream, rootParent);
  let component;

  dispatcher = dispatcher
    .scan((({state}, action) => {
      const {state : newState, effects=[], params} = action(state);
      return {state: newState, effects, params: params}
    }), {state: initialState})
    .startWith({state: initialState});

  middlewares.forEach((middleWare) => {
    dispatcher = dispatcher.map(middleWare)
  });

  streamWrapper.disposable = dispatcher
    .do(({state}) => component && component.setState(stateSerializer(state)))
    .do(({effects=[]}) =>
      effects.forEach((e) =>
        Rx.Observable.spawn(e(streamWrapper))
        .flatMap((obs) => obs || [])
        .subscribe(
          Rx.helpers.noop,
          console.error.bind(console)
        )
      )
    )
    .subscribe(
      Rx.helpers.noop,
      console.error.bind(console)
    );

  streamWrapper.send('init');

  component = ReactDOM.render(
    React.createElement(
      Root,
      {
        view,
        tanokStream: streamWrapper,
        eventStream: streamWrapper,
        ...stateSerializer(initialState),
      }
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

export function effectWrapper(effect, parent) {
  return ({ stream }) => {
    return effect
      ? effect(new StreamWrapper(stream, parent))
      : Rx.helpers.noop;
  };
}

/**
* Usage example:
* class HelloWorldDispatcher extends TanokDispatcher {
*
*   @on('helloEvent')
*   helloWorld (eventPayload, state) {
*     state.word = eventPayload.word;
*     return [state, helloWorldEffect];
*   }
* }
*
* var helloWorldDispatcher = new HelloWorldDispatcher();
* tanok(HelloWorldModel, helloWorldDispatcher.collect(), ViewComponent, {container})
* */
export class TanokDispatcher {
  [Symbol.iterator]() {
    function makeIterator(array){
        var nextIndex = 0;

        return {
           next: function(){
               return nextIndex < array.length ?
                   {value: array[nextIndex++], done: false} :
                   {done: true};
           }
        };
    }

    return makeIterator(this.collect());
  }

  collect() {
    return this.events.map(([predicate, stateMutator]) => [predicate, stateMutator.bind(this)]);
  }
}
