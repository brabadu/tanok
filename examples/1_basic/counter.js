import React from 'react'
import {on, TanokDispatcher, tanokComponent} from '../../lib/tanok.js';

/*
  Model
*/
export function init() {
  return {
    count: 0,
  }
};

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
    return [state];
  }

  @on('dec')
  dec(payload, state) {
    state.count -= 1;
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
        <span>{this.props.count}</span>
        <button onClick={this.onPlusClick}>+</button>
      </div>
    )
  }
}
