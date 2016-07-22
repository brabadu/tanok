import React from 'react';
import {on, TanokDispatcher, effectWrapper, subcomponentFx, rethrowFx, tanokComponent} from '../../lib/tanok.js';

import {init as counterInit,
        CounterDispatcher, Counter} from './counter-collection.js';


export function init() {
  return {
    counters: Array.from({length: 10}).map((_, ind) => counterInit(ind)),
  }
}

export class Dashboard extends TanokDispatcher {
  @on('init')
  init(payload, state) {
    return [state,
      subcomponentFx('countersChange', (new CounterDispatcher).collect()),
    ]
  }

  @on('countersChange')
  countersChange(payload, state, {metadata}) {
    const [newState, ...effects] = payload(state.counters[metadata]);
    state.counters[metadata] = newState;
    return [state, ...effects.map((e) => effectWrapper(e, 'countersChange'))]
  }
}

@tanokComponent
export class CountersCollection extends React.Component {
  render() {
      return <div>
        {this.props.counters.map((counter) =>
          <Counter key={counter.id} tanokStream={this.sub('countersChange')} {...counter} />
        )}
      </div>
  }
}
