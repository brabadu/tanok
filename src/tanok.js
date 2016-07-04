import Rx from 'rx';
import React from 'react';
import ReactDOM from 'react-dom';
import { StreamWrapper, dispatch } from './streamWrapper.js';
import { on } from './decorators';

const identity = (value) => value;

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
 * @returns { TanokReturnValue } - Returns disposable as result of your observers applying,
 * and your app inner eventStream.
 * */
export function tanok(initialState, update, view, options) {
  let { container, outerEventStream, stateSerializer = identity } = options || {};
  if (!container) {
    container = document.createElement('div');
    document.body.appendChild(container);
  }

  const eventStream = new Rx.Subject();
  const rootParent = null;
  let dispatcher = dispatch(eventStream, update, rootParent);

  if (outerEventStream) {
    dispatcher = Rx.Observable.merge(
      dispatcher,
      dispatch(outerEventStream, update, rootParent)
    );
  }
  const streamWrapper = new StreamWrapper(eventStream, rootParent);

  const disposable = dispatcher
    .scan((([state, _], action) => action(state)), [initialState])
    .startWith([initialState])
    .do(([state]) => ReactDOM.render(
      React.createElement(
        view,
        {...stateSerializer(state), eventStream: streamWrapper}
      ),
      container
    ))
    .do(([_, ...effects]) =>
      effects.forEach((e) =>
        Rx.Observable.spawn(e(streamWrapper)).subscribe(
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

  return { disposable, eventStream };
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
  collect() {
    return this.events.map(([predicate, stateMutator]) => [predicate, stateMutator.bind(this)]);
  }
}

export {
  on,
};
