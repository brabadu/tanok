import React from 'react';
import PropTypes from 'prop-types';

import { storeKey, streamKey, subscriptionKey } from '../constants';
import { storeShape, subscriptionShape } from '../connect/utils/PropTypes';

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
    name: storeShape.isRequired,
    metadata: PropTypes.element.isRequired,
};
Subcomponent.childContextTypes = {
    [streamKey]: PropTypes.any.isRequired,
};
Subcomponent.contextTypes = {
    [streamKey]: PropTypes.any.isRequired,
};