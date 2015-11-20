import React from 'react';
import {render} from 'react-dom';
import Rx from 'rx';
import {actionIs} from './helpers.js';
import {StreamWrapper} from './streamWrapper.js';

export function tanok (initialState, update, View, container) {
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


  return {disposable, eventStream}
}

export { tanok as default };
