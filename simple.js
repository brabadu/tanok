import React from 'react';
import {render} from 'react-dom';
import Rx from 'rx';
import {actionIs} from './helpers.js';


/*
update is an Array of pairs: [actionName, actionHandler]
*/

export default function(model, update, View, container) {
  let eventStream = new Rx.Subject();

  let dispatcherArray = update.map(([actionName, actionHandler]) =>
    eventStream.filter(actionIs(actionName)).map(actionHandler))

  return Rx.Observable
    .merge(...dispatcherArray)
    .scan((state, action) => action(state), model)
    .startWith(model)
    .do((state) => render(<View {...state} eventStream={eventStream}/>, container))
    .subscribe(
      Rx.helpers.noop,
      console.error.bind(console)
    );
}
