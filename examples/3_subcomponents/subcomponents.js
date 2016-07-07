import React from 'react';
import {on, TanokDispatcher, effectWrapper, subcomponentFx, tanokComponent} from '../../lib/tanok.js';

import {init as counterInit,
        CounterDispatcher, Counter} from '../2_effects/counter-effects.js';


export function init() {
  return {
    top: counterInit(),
    bottom: counterInit(),
  }
}

export class Dashboard extends TanokDispatcher {
  @on('init')
  init(payload, state) {
    return [state,
      subcomponentFx('top', (new CounterDispatcher).collect()),
      subcomponentFx('bottom', (new CounterDispatcher).collect()),
    ]
  }

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

@tanokComponent
export class TwoCounters extends React.Component {
  render() {
        return <div>
          <Counter {...this.props.top} eventStream={this.sub('top')} />
          <Counter {...this.props.bottom} eventStream={this.sub('bottom')} />
        </div>
    }
}
