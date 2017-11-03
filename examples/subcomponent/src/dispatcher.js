import { on, TanokDispatcher, subcomponentFx, childFx } from 'tanok';

import { CounterDispatcher } from './counter/dispatcher';

export class DashboardDispatcher extends TanokDispatcher {
  @on('init')
  init(payload, state) {
    return [state,
      subcomponentFx('top', new CounterDispatcher()),
      subcomponentFx('bottom', new CounterDispatcher()),
    ]
  }

  @on('top')
  top(payload, state) {
    const [newState, ...effects] = payload(state.top);
    state.top = newState;
    return [state, ...effects.map((e) => childFx(e, 'top'))]
  }

  @on('bottom')
  bottom(payload, state) {
    const [newState, ...effects] = payload(state.bottom);
    state.bottom = newState;
    return [state, ...effects.map((e) => childFx(e, 'bottom'))]
  }
}