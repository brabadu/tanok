import React from 'react'
import tanok from '../../tanok.js';
import {actionIs, filter, debounce} from '../../utils.js';

/*
  MODEL
*/
let model = {
  count: 0,
  history: []
};

/*
  UPDATE
*/
let update = [
  [[filter(actionIs('inc'))], (params) => (state) => {
    state.count += 1
    return [state, wowEffect]
  }],
  [[filter(actionIs('dec'))], (params) => (state) => {
    state.count -= 1
    return [state]
  }],
  [[filter(actionIs('wow')), debounce(1000)], (params) => (state) => {
    state.history.push(state.count)
    return [state]
  }]
]

function wowEffect (state, eventStream) {
  return Rx.Observable.just(1).do(function(){
    eventStream.onNext({
      action: 'wow'
    })
  })
}

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
        History: [{this.props.history.join(', ')}]
        </div>
    }
});


/*
  Starting the app
*/
let div = document.createElement('div');
document.body.appendChild(div)
tanok(model, update, Counter, div);
