import React from 'react';
import { tanokComponent } from 'tanok';

import { Counter } from './counter/view';

@tanokComponent
export class TwoCounters extends React.Component {
  render() {
        return (
          <div>
            {this.props.counters.map((counter) =>
              <Counter
                key={counter.id}
                tanokStream={this.sub('counter', counter.id)}
                {...counter}
              />
            )}
          </div>
        );
    }
}
