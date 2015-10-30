import React from 'react'
import tanok from '../../simple.js';
import {actionIs, filter, debounce} from '../../utils.js';

/*
  MODEL
*/
let model = {
  count: 0,
};

/*
  UPDATE
*/
let update = [
  ['inc', (params) => (state) => {
    state.count += 1
    return state
  }],
  ['dec', (params) => (state) => {
    state.count -= 1
    return state
  }],
]

/*
  VIEW
*/
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


/*
  Starting the app
*/
let div = document.createElement('div');
document.body.appendChild(div)
tanok(model, update, Counter, div);
