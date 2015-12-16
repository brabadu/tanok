import React from 'react';
import {tanok, effectWrapper} from '../../tanok.js';
import TanokMixin from '../../mixin.js';
import {init as counterInit,
        update as counterUpdate, Counter} from '../main/counter.js';
import {actionIs} from '../../helpers.js';


let model = {
  top: counterInit(),
  bottom: counterInit()
}

let update = [
  [[actionIs('top')], (params, state) => {
    let [newState, effect] = params.payload(state.top);
    state.top = newState
    return [state, effectWrapper(effect, 'top')];
  }],
  [[actionIs('bottom')], (params, state) => {
    let [newState, effect] = params.payload(state.bottom);
    state.bottom = newState
    return [state, effectWrapper(effect, 'bottom')];
  }]
]

const TwoCounters = React.createClass({
  mixins: [TanokMixin],

  componentWillMount: function() {
    this.setState({
      topEs: this.subStream('top', counterUpdate),
      bottomEs: this.subStream('bottom', counterUpdate)
    })
  },
  componentWillUnmount: function () {
    this.state.topEs.disposable();
    this.state.bottomEs.disposable();
  },
  render: function() {
        return <div>
          <Counter {...this.props.top} eventStream={this.state.topEs} />
          <Counter {...this.props.bottom} eventStream={this.state.bottomEs} />
        </div>
    }
});


/*
  Starting the app
*/
let div = document.createElement('div');
document.body.appendChild(div)
tanok(model, update, TwoCounters, div);
