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
  CountersCollection,
} from './4_subcomponent_collection/subcomponents.js';

tanok(init_1(), (new CounterDispatcher1).collect(), Counter1);
tanok(init_2(), (new CounterDispatcher2).collect(), Counter2);
tanok(init_3(), (new Dashboard).collect(), TwoCounters);
tanok(init_4(), (new Dashboard2).collect(), CountersCollection);
