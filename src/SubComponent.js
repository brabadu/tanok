import React, { Component, Children } from 'react';
import PropTypes from 'prop-types';
import { StreamWrapper } from './streamWrapper.js';

export class SubComponent extends Component {
  constructor(props, context) {
    super(props, context);
    const metadata = props.metadata;
    const name = props.name;
    const stream = context.tanokStream;
    let tanokStream;
    if (metadata != null) {
      tanokStream = stream.subWithMeta(name, metadata);
    } else {
      tanokStream = stream && stream.subs[name];
    }
    this.tanokStream = tanokStream;
  }

  getChildContext() {
    return { tanokStream: this.tanokStream }
  }

  render() {
    return Children.only(this.props.children)
  }
}

SubComponent.childContextTypes = {
  tanokStream: PropTypes.instanceOf(StreamWrapper).isRequired,
};
SubComponent.contextTypes = {
  tanokStream: PropTypes.instanceOf(StreamWrapper).isRequired,
};
SubComponent.defaultProps = {
  metadata: null,
};
SubComponent.propTypes = {
  name: PropTypes.any.isRequired,
  metadata: PropTypes.any,
};
