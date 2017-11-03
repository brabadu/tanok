import React from 'react';
import { tanokComponent } from 'tanok';

import { Counter } from './counter/view';

@tanokComponent
export class TwoCounters extends React.Component {
  render() {
        return (
          <div>
            <Counter {...this.props.top} tanokStream={this.sub('top')} />
            <Counter {...this.props.bottom} tanokStream={this.sub('bottom')} />
          </div>
        );
    }
}
