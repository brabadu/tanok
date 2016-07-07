import React from 'react';
import {on, TanokDispatcher, effectWrapper, tanokComponent} from '../../lib/tanok.js';

import {init as counterInit,
        CounterDispatcher, Counter} from './counter-collection.js';


export function init() {
  return {
    counters: Array.from({length: 10}).map((_, ind) => counterInit(ind)),
  }
}

export class Dashboard extends TanokDispatcher {
  @on('countersChange')
  countersChange(payload, state, {metadata}) {
    const [newState, ...effects] = payload(state.counters[metadata]);
    state.counters[metadata] = newState;
    return [state, ...effects.map((e) => effectWrapper(e, 'countersChange'))]
  }
}

@tanokComponent
export class CountersCollection extends React.Component {
  componentWillMount() {
    this.setState({
      countersChange: this.subStream('countersChange', (new CounterDispatcher).collect()),
    });
  }

  componentWillUnmount() {
    this.state.countersChange.disposable();
  }

  render() {
      return <div>
        {this.props.counters.map((counter) =>
          <Counter key={counter.id} {...counter} eventStream={this.state.countersChange} />
        )}
      </div>
  }
}
