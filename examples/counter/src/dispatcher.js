import { on, TanokDispatcher } from 'tanok';

export class CounterDispatcher extends TanokDispatcher {
  @on('init')
  init(payload, state) {
    state.count = 10;
    return [state];
  }

  @on('inc')
  inc(payload, state) {
    state.count += 1;
    return [state];
  }

  @on('dec')
  dec(payload, state) {
    state.count -= 1;
    return [state];
  }

}