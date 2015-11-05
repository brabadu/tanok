import React from 'react';
import {tanok, effectWrapper} from '../../tanok.js';
import {init as counterInit,
        update as counterUpdate, Counter} from '../main/counter.js';
import {actionIs, parentIs} from '../../helpers.js';


let model = {
  top: counterInit(),
  bottom: counterInit()
}

let update = [
  [[actionIs('top')], (params, state) => {
    let [newState, effect] = params.payload(state.top);
    state.top = newState
    // return [state, effectWrapper(effect, 'top')];
    return [state];
  }],
  [[actionIs('bottom')], (params, state) => {
    let [newState, effect] = params.payload(state.bottom);
    state.bottom = newState
    return [state, effectWrapper(effect, 'bottom')];
  }]
]

const TwoCounters = React.createClass({
  componentWillMount: function() {
    this.setState({
      topEs: this.props.es.wrap('top', counterUpdate),
      bottomEs: this.props.es.wrap('bottom', counterUpdate)
    })
  },
  componentWillUnmount: function () {
    this.state.topEs.disposable();
    this.state.bottomEs.disposable();
  },
  render: function() {
        return <div>
          <Counter {...this.props.top} es={this.state.topEs} />
          <Counter {...this.props.bottom} es={this.state.bottomEs} />
        </div>
    }
});


/*
  Starting the app
*/
let div = document.createElement('div');
document.body.appendChild(div)
tanok(model, update, TwoCounters, div);
