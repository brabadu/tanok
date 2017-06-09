import {tanok} from '../lib/tanok.js';

import {
  init as init_1,
  CounterDispatcher as CounterDispatcher1,
  Counter as Counter1,
} from './1_basic/counter.js';


import {
  init as init_2,
  CounterDispatcher as CounterDispatcher2,
  Counter as Counter2,
} from './2_effects/counter-effects.js';

import {
  init as init_3,
  Dashboard,
  TwoCounters,
} from './3_subcomponents/subcomponents.js';

import {
  init as init_4,
  Dashboard as Dashboard2,
  TwoColumns,
} from './4_subcomponent_collection/two_columns.js';

import { loggingMiddleware } from './7_middlewares/middlewares'

// basic usage
tanok(init_1(), (new CounterDispatcher1), Counter1, {
  container: document.getElementById('basics'),
  middlewares: [loggingMiddleware(1), loggingMiddleware(2)],
});

// Using effects (asynchronous events)
tanok(init_2(), (new CounterDispatcher2), Counter2, {
  container: document.getElementById('effects'),
});

// Simple subcomponents
tanok(init_3(), (new Dashboard), TwoCounters, {
  container: document.getElementById('subcomponents'),
});

// Subcomponents for handling collection of subitems
tanok(init_4(), (new Dashboard2), TwoColumns, {
  container: document.getElementById('sub-collection'),
});

// Outer event stream example
import Rx from 'rx';

const ticks = Rx.Observable.interval(1000).map(() => ({
  streamName: null,
  action: 'inc'
}));
tanok(init_1(), (new CounterDispatcher1), Counter1, {
  container: document.getElementById('outer-event-stream'),
  outerEventStream: ticks
});
