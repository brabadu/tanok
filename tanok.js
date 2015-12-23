import React from 'react';
import {render} from 'react-dom';
import Rx from 'rx';
import {StreamWrapper, dispatch} from './streamWrapper.js';

export function tanok (initialState, update, View, {container, outerEventStream}) {
  if (!container) {
      container = document.createElement('div');
      document.body.appendChild(container);
  }

  const eventStream = new Rx.Subject();
  const stateStream = new Rx.BehaviorSubject(initialState);
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
    .do(([state, _]) => render(<View {...state} eventStream={streamWrapper} />, container))
    .do(([state, _]) => stateStream.onNext(state))
    .flatMap(([state, effect]) => effect ? effect(state, streamWrapper) : Rx.Observable.empty() )
    .subscribe(
      Rx.helpers.noop,
      console.error.bind(console)
    );

  streamWrapper.send('init');

  return {disposable, eventStream, stateStream}
}

export function effectWrapper(effect, parent) {
  return (state, {stream}) => effect
    ? effect(state, new StreamWrapper(stream, parent))
    : Rx.helpers.noop
}

export { tanok as default };
