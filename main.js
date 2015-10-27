import StartApp from './simple.js';
import React from 'react'

let model = {count: 0};
let update = [
  ['inc', (params) => (state) => {
    state.count += 1
    return state
  }],
  ['dec', (params) => (state) => {
    state.count -= 1
    return state
  }]
]


const Counter = React.createClass({
  onPlusClick: function() {
    this.props.eventStream.onNext({
      action: 'inc',
    })
  },
  onMinusClick: function() {
    this.props.eventStream.onNext({
      action: 'dec',
    })
  },
  render: function() {
        return <div>
        <button onClick={this.onPlusClick}>+</button>
        <span>{this.props.count}</span>
        <button onClick={this.onMinusClick}>-</button>
        </div>
    }
});

let div = document.createElement('div');
document.body.appendChild(div)
StartApp(model, update, Counter, div);
