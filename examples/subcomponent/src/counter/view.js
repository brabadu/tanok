import React from 'react';
import { tanokComponent } from 'tanok';

@tanokComponent
export class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.onPlusClick = this.onPlusClick.bind(this);
    this.onMinusClick = this.onMinusClick.bind(this);
    this.onEffectsClick = this.onEffectsClick.bind(this);
  }
  onPlusClick() {
    this.send('inc')
  }
  onMinusClick() {
    this.send('dec')
  }
  onEffectsClick() {
    this.send('effectKinds')
  }
  render() {
    return (
      <div>
        <button onClick={this.onMinusClick}>-</button>
        <span style={{color: this.props.synced ? 'green' : 'red'}}>{this.props.count}</span>
        <button onClick={this.onPlusClick}>+</button>
        <button onClick={this.onEffectsClick}>Different kinds of effect</button>
      </div>
    )
  }
}
