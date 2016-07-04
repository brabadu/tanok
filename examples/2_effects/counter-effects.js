import React from 'react'
import tanokComponent from '../../lib/component.js';
import {on, TanokDispatcher} from '../../lib/tanok.js';


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
    fetch('http://www.mocky.io/v2/577824a4120000ca28aac904')
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
  }
  onPlusClick() {
    this.send('inc')
  }
  onMinusClick() {
    this.send('dec')
  }
  render() {
    return (
      <div>
        <button onClick={this.onMinusClick}>-</button>
        <span style={{color: this.props.synced ? 'green' : 'red'}}>{this.props.count}</span>
        <button onClick={this.onPlusClick}>+</button>
      </div>
    )
  }
}
