import React from 'react';
import PropTypes from 'prop-types';

import { streamKey } from '../constants';

export class Subcomponent extends React.Component {
  constructor(props, context) {
    super(props, context);

    const stream = context[streamKey];
    const {name, metadata} = props;

    if (metadata !== null) {
      this[streamKey] = stream && stream.subWithMeta(name, metadata);
    } else {
      this[streamKey] = stream && stream.subs[name];
    }

  }

  getChildContext() {
    return {
      [streamKey]: this[streamKey],
    }
  }

  render() {
    return React.Children.only(this.props.children);
  }
}

Subcomponent.propTypes = {
    name: PropTypes.any.isRequired,
    metadata: PropTypes.any.isRequired,
};
Subcomponent.childContextTypes = {
    [streamKey]: PropTypes.any.isRequired,
};
Subcomponent.contextTypes = {
    [streamKey]: PropTypes.any.isRequired,
};
