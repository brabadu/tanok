import React from 'react'
import TanokWrapper from '../../component.js';
import {actionIs, filter, debounce} from '../../helpers.js';

/*
  MODEL
*/
export function init() {
  return {
    count: 0,
    history: []
  }
};

/*
  UPDATE
*/
export let update = [
  ['init', (params, state) => {
    state.count = 555;
    return [state];
  }],
  [[actionIs('inc')], (params, state) => {
    state.count += 1
    return [state, wowEffect]
  }],
  [[actionIs('dec')], (params, state) => {
    state.count -= 1
    return [state, wowEffect]
  }],
  [[actionIs('wow'), debounce(1000)], (params, state) => {
    state.history.push(state.count)
    return [state]
  }]
]

function wowEffect (state, es) {
  return Rx.Observable.just(1).do(function(){
    es.send('wow')
  })
}

/*
  VIEW
*/
class Counter extends React.Component {
  onPlusClick() {
    this.send('inc')
  }
  onMinusClick() {
    this.send('dec')
  }
  render() {
        return <div>
        <button onClick={this.onPlusClick.bind(this)}>+</button>
        <span>{this.props.count}</span>
        <button onClick={this.onMinusClick.bind(this)}>-</button>
        History: [{this.props.history.join(', ')}]
        </div>
    }
}

let TCounter = TanokWrapper(Counter)

export {TCounter as Counter};
