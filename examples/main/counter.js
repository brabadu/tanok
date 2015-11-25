import React from 'react'
import TanokMixin from '../../mixin.js';
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
  [[actionIs('init')], (params, state) => {
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
export const Counter = React.createClass({
  mixins: [TanokMixin],

  onPlusClick: function() {
    this.send('inc')
  },
  onMinusClick: function() {
    this.send('dec')
  },
  render: function() {
        return <div>
        <button onClick={this.onPlusClick}>+</button>
        <span>{this.props.count}</span>
        <button onClick={this.onMinusClick}>-</button>
        History: [{this.props.history.join(', ')}]
        </div>
    }
});
