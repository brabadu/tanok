import React from 'react';
import {render} from 'react-dom';
import Rx from 'rx';
import {actionIs} from './helpers.js';

class StreamWrapper {
  constructor (stream, parent) {
    this.stream = stream;
    this.parent = parent;
    this.disposable = null;
  };

  dispatch (updateHandlers) {
    let parentStream = this.stream.filter(({parent}) => parent === this.parent)

    let dispatcherArray = updateHandlers.map(([actionCondition, actionHandler]) =>
      actionCondition
        .reduce((accStream, cond) => cond.call(accStream), parentStream)
        .map((params) => (state) => actionHandler(params, state)))

    return Rx.Observable.merge(...dispatcherArray);
  }

  wrap (parent, subUpdate) {
    let subStreamWrapper = new StreamWrapper(this.stream, parent);

    this.disposable = subStreamWrapper
      .dispatch(subUpdate)
      .do((stateMutator) => this.send(parent, stateMutator))
      .subscribe(
        Rx.helpers.noop,
        console.error.bind(console)
      );

    return subStreamWrapper;
  }

  send (action, payload) {
    this.stream.onNext({action, payload, parent: this.parent})
  }
}

export function effectWrapper(effect, parent) {
  return (state, {stream}) => effect
    ? effect(state, new StreamWrapper(stream, parent))
    : Rx.helpers.noop
}

export function tanok (model, update, View, container) {
  let eventStream = new Rx.Subject();

  const streamWrapper = new StreamWrapper(eventStream, null);
  let disposable = streamWrapper.dispatch(update)
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

export { tanok as default };
