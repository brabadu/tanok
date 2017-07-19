import React from 'react';
import {on, TanokDispatcher, childFx, subcomponentFx, rethrowFx, tanokComponent, SubComponent} from '../../lib/tanok.js';

import {init as counterInit,
        CounterDispatcher, Counter} from './counter-collection.js';


const COUNTERS_CHANGE = 'countersChange';

export function init() {
  return {
    counters: Array.from({length: 10}).map((_, ind) => counterInit(ind)),
  }
}

export class Dashboard extends TanokDispatcher {
  @on('init')
  init(payload, state) {
    return [state,
      subcomponentFx(COUNTERS_CHANGE, (new CounterDispatcher).collect()),
    ]
  }

  @on(COUNTERS_CHANGE)
  countersChange(payload, state, {metadata}) {
    const [newState, ...effects] = payload(state.counters[metadata]);
    state.counters[metadata] = newState;
    return [state, ...effects.map((e) => childFx(e, COUNTERS_CHANGE, metadata))]
  }
}

@tanokComponent
export class CountersCollection extends React.Component {
  render() {
      return <div>
        {this.props.counters.map((counter) =>
          <SubComponent
            key={counter.id}
            name={COUNTERS_CHANGE}
            metadata={counter.id}
          >
            <Counter
              {...counter}
            />
          </SubComponent>
        )}
      </div>
  }
}
