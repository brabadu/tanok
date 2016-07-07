import React from 'react'
import {on, TanokDispatcher, tanokComponent} from '../../lib/tanok.js';

/*
  Model
*/
export function init(id) {
  return {
    id: id,
    count: 0,
    synced: false,
  }
};

/*
  Effects
*/
function syncEffect(id, cnt) {
  return function (stream) {
    fetch('http://www.mocky.io/v2/577824a4120000ca28aac904', {
      method: 'POST',
      body: cnt,
    })
      .then((r) => r.json())
      .then((json) => stream.send('syncSuccess', json, id))
  }
}


/*
  Update
*/
export class CounterDispatcher extends TanokDispatcher {
  @on('inc')
  inc(payload, state) {
    state.count += 1;
    state.synced = false;

    return [state, syncEffect(state.id, state.count)];
  }

  @on('dec')
  dec(payload, state) {
    state.count -= 1;
    state.synced = false;

    return [state, syncEffect(state.id, state.count)];
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
    this.send('inc', null, this.props.id)
  }
  onMinusClick() {
    this.send('dec', null, this.props.id)
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
