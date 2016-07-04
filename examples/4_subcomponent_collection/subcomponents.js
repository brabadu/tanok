import React from 'react';
import tanokComponent from '../../lib/component.js';
import {on, TanokDispatcher, effectWrapper} from '../../lib/tanok.js';

import {init as counterInit,
        CounterDispatcher, Counter} from './counter-collection.js';


export function init() {
  return {
    counters: Array.from({length: 10}).map((_, ind) => counterInit(ind)),
  }
}

export class Dashboard extends TanokDispatcher {
  @on('countersChange')
  countersChange(payload, state, {metakey}) {
    const [newState, ...effects] = payload(state.counters[metakey]);
    state.counters[metakey] = newState;
    return [state, ...effects.map((e) => effectWrapper(e, 'counters'))]
  }
}

@tanokComponent
export class CountersCollection extends React.Component {
  componentWillMount() {
    this.setState({
      topEs: this.subStream('top', (new CounterDispatcher).collect()),
      bottomEs: this.subStream('bottom', (new CounterDispatcher).collect())
    })
  }

  componentWillUnmount() {
    this.state.topEs.disposable();
    this.state.bottomEs.disposable();
  }

  render() {
      return <div>
        <Counter {...this.props.top} eventStream={this.state.topEs} />
        <Counter {...this.props.bottom} eventStream={this.state.bottomEs} />
      </div>
  }
}
