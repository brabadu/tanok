import React from 'react';
import {render} from 'react-dom';
import Rx from 'rx';


/*
update is an Array of pairs: [actionName, actionHandler]
*/

function actionIs(actionName) {
  return ({action}) => action === actionName;
}

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
      function(){},
      console.error.bind(console)
    );
}
