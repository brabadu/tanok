import React from 'react';
import {render} from 'react-dom';
import Rx from 'rx';
import {actionIs} from './utils.js';


/*
update is an Array of trios: [actionName, actionHandler, effect]
*/

export default function(model, update, View, container) {
  let eventStream = new Rx.Subject();

  let dispatcherArray = update.map(([actionName, actionHandler]) =>
    eventStream.filter(actionIs(actionName)).map(actionHandler))

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
