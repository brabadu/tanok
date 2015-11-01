import React from 'react';
import {render} from 'react-dom';
import Rx from 'rx';
import {actionIs} from './helpers.js';

class StreamWrapper {
  constructor(stream) {
    this.stream = stream
  };

  send(action, data) {
    this.stream.onNext({action, data})
  }
}

export default function(model, update, View, container) {
  let eventStream = new Rx.Subject();

  let dispatcherArray = update.map(([actionCondition, actionHandler]) =>
    actionCondition
      .reduce((accStream, cond) => cond.call(accStream), eventStream)
      .map((params) => (state) => actionHandler(params, state)))

  const streamWrapper = new StreamWrapper(eventStream);
  let disposable = Rx.Observable
    .merge(...dispatcherArray)
    .scan((([state, _], action) => action(state)), [model])
    .startWith([model])
    .do(([state, _]) => render(<View {...state} es={streamWrapper} />, container))
    .flatMap(([state, effect]) => effect ? effect(state, streamWrapper) : Rx.Observable.empty() )
    .subscribe(
      Rx.helpers.noop,
      console.error.bind(console)
    );

  return {disposable, eventStream}
}
