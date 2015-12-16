import React from 'react';
import {render} from 'react-dom';
import Rx from 'rx';
import {actionIs} from './helpers.js';
import {StreamWrapper} from './streamWrapper.js';

export function tanok (initialState, update, View, container) {
  if (!container) {
      container = document.createElement('div');
      document.body.appendChild(container);
  }

  let eventStream = new Rx.Subject();

  const streamWrapper = new StreamWrapper(eventStream, null);
  let disposable = streamWrapper.dispatch(update)
    .scan((([state, _], action) => action(state)), [initialState])
    .startWith([initialState])
    .do(([state, _]) => render(<View {...state} eventStream={streamWrapper} />, container))
    .flatMap(([state, effect]) => effect ? effect(state, streamWrapper) : Rx.Observable.empty() )
    .subscribe(
      Rx.helpers.noop,
      console.error.bind(console)
    );

  streamWrapper.send('init');

  return {disposable, eventStream}
}

export function effectWrapper(effect, parent) {
  return (state, {stream}) => effect
    ? effect(state, new StreamWrapper(stream, parent))
    : Rx.helpers.noop
}

export { tanok as default};
