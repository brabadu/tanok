import React from 'react';
import PropTypes from 'prop-types';

import { storeKey, streamKey, subscriptionKey } from '../constants';
import { storeShape, subscriptionShape } from '../connect/utils/PropTypes';

export class Root extends React.Component {
  constructor(props, context) {
    super(props, context);
    this[storeKey] = props.store;
    this[streamKey] = props.tanokStream;
  }

  getChildContext() {
    return {
      [storeKey]: this[storeKey],
      [streamKey]: this[streamKey],
      [subscriptionKey]: null,
    }
  }

  render() {
    return React.Children.only(this.props.children);
  }
}

Root.propTypes = {
    store: storeShape.isRequired,
    children: PropTypes.element.isRequired,
};
Root.childContextTypes = {
    [storeKey]: storeShape.isRequired,
    [streamKey]: PropTypes.any.isRequired,
    [subscriptionKey]: subscriptionShape,
};
