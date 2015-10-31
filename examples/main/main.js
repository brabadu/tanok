import React from 'react'
import tanok from '../../tanok.js';
import {actionIs, filter, debounce} from '../../helpers.js';

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

function wowEffect (state, es) {
  return Rx.Observable.just(1).do(function(){
    es.send('wow')
  })
}

/*
  VIEW
*/
const Counter = React.createClass({
  onPlusClick: function() {
    this.props.es.send('inc')
  },
  onMinusClick: function() {
    this.props.es.send('dec')
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
