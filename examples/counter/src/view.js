import React from 'react';
import { tanokComponent } from 'tanok';

@tanokComponent
export class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.onPlusClick = this.onPlusClick.bind(this);
    this.onMinusClick = this.onMinusClick.bind(this);
  }

  onPlusClick() {
    this.send('inc')
  }

  onMinusClick() {
    this.send('dec')
  }

  render() {
    return (
      <div>
        <button onClick={this.onMinusClick}>-</button>
        <span>{this.props.count}</span>
        <button onClick={this.onPlusClick}>+</button>
      </div>
    );
  }
}
