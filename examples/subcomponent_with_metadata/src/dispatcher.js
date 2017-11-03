import { on, TanokDispatcher, subcomponentFx, childFx } from 'tanok';

import { CounterDispatcher } from './counter/dispatcher';

export class DashboardDispatcher extends TanokDispatcher {
  @on('init')
  init(payload, state) {
    return [state,
      subcomponentFx('counter', new CounterDispatcher()),
    ]
  }

  @on('counter')
  top(payload, state, { metadata }) {
    const [newState, ...effects] = payload(state.counters[metadata]);
    state.top = newState;
    return [state, ...effects.map((e) => childFx(e, 'counter', metadata))]
  }
}