import { on, TanokDispatcher } from 'tanok';
import Rx from '@evo/rx';

function syncEffect(cnt) {
  return function (stream) {
    fetch('http://www.mocky.io/v2/577824a4120000ca28aac904', {
      method: 'POST',
      body: cnt,
    })
      .then((r) => r.json())
      .then((json) => stream.send('syncSuccess', json))
  }
}


export class CounterDispatcher extends TanokDispatcher {
  @on('init')
  init(payload, state) {
    state.count = 10;
    return [state];
  }

  @on('inc')
  inc(payload, state) {
    state.count += 1;
    state.synced = false;

    return [state, syncEffect(state.count)];
  }

  @on('dec')
  dec(payload, state) {
    state.count -= 1;
    state.synced = false;

    return [state, syncEffect(state.count)];
  }

  @on('syncSuccess')
  syncSuccess(payload, state) {
    state.synced = true;
    return [state];
  }

  @on('effectKinds')
  promise(payload, state) {
    function promiseFx(stream){
      return new Promise((resolve, reject) => {
        stream.send('done', 'Promise done')
        return resolve(1);
      })
    }

    function observableFx(stream) {
      return Rx.Observable.create((obs) => {
        stream.send('done', 'Observable done')
        obs.onNext(1);
        obs.onCompleted();
      })
    }

    return [state, promiseFx, observableFx];
  }

  @on('done')
  done(payload, state) {
    console.log(state.id, payload);
    return [state];
  }
}
