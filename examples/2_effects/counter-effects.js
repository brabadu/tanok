import React from 'react'
import {on, TanokDispatcher, tanokComponent} from '../../lib/tanok.js';


/*
  Model
*/
export function init() {
  return {
    count: 0,
    synced: false,
  }
};

/*
  Effects
*/
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


/*
  Update
*/

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
    console.log(payload)
    return [state];
  }

}

/*
  View
*/
@tanokComponent
export class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.onPlusClick = this.onPlusClick.bind(this);
    this.onMinusClick = this.onMinusClick.bind(this);
    this.onEffectsClick = this.onEffectsClick.bind(this);
  }
  onPlusClick() {
    this.props.send('inc')
  }
  onMinusClick() {
    this.props.send('dec')
  }
  onEffectsClick() {
    this.props.send('effectKinds')
  }
  render() {
    return (
      <div>
        <button onClick={this.onMinusClick}>-</button>
        <span style={{color: this.props.synced ? 'green' : 'red'}}>{this.props.count}</span>
        <button onClick={this.onPlusClick}>+</button>
        <button onClick={this.onEffectsClick}>Different kinds of effect</button>
      </div>
    )
  }
}
