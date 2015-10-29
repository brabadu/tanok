import React from 'react';
import {render} from 'react-dom';
import Rx from 'rx';
import {actionIs} from './utils.js';

export default function(model, update, View, container) {
  let eventStream = new Rx.Subject();

  let dispatcherArray = update.map(([actionCondition, actionHandler]) =>
    actionCondition
      .reduce((accStream, cond) => cond.call(accStream), eventStream)
      .map(actionHandler))

  return Rx.Observable
    .merge(...dispatcherArray)
    .scan((([state, _], action) => action(state)), [model])
    .startWith([model])
    .do(([state, _]) => render(<View {...state} eventStream={eventStream} />, container))
    .flatMap(([state, effect]) => effect ? effect(state, eventStream) : Rx.Observable.empty() )
    .subscribe(
      function(){},
      console.error.bind(console)
    );
}
