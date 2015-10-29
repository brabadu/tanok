import StartApp from './tanok.js';
import React from 'react'
import {actionIs, filter, debounce} from './utils.js';


let model = {
  count: 0,
  history: []
};

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

let div = document.createElement('div');
document.body.appendChild(div)
StartApp(model, update, Counter, div);
