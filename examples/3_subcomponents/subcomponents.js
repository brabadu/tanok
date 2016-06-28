import React from 'react';
import tanokComponent from '../../lib/component.js';

import {init as counterInit,
        update as counterUpdate, Counter} from '../main/counter.js';


function init() {
  return {
    top: counterInit(),
    bottom: counterInit(),
  }
}

export class Dashboard extends TanokDispatcher {
  @on('top')
  top(payload, state) {
    const [newState, ...effects] = payload(state.top);
    state.top = newState;
    return [state, ...effects.map((e) => effectWrapper(e, 'top'))]
  }

  @on('bottom')
  bottom(payload, state) {
    const [newState, ...effects] = payload(state.bottom);
    state.bottom = newState;
    return [state, ...effects.map((e) => effectWrapper(e, 'bottom'))]
  }
}

export class TwoCounters extends React.Component({

  componentWillMount() {
    this.setState({
      topEs: this.subStream('top', counterUpdate),
      bottomEs: this.subStream('bottom', counterUpdate)
    })
  },

  componentWillUnmount() {
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
