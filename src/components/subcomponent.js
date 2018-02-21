import React from 'react';
import PropTypes from 'prop-types';

import { streamKey, storeKey } from '../constants';

export class Subcomponent extends React.Component {
  constructor(props, context) {
    super(props, context);

    const stream = context[streamKey];
    const store = context[storeKey];
    const {name, metadata, selector} = props;

    this[storeKey] = {
      ...store,
      getState: () => {
        return selector(store.getState());
      },
    };

    if (metadata !== null) {
      this[streamKey] = stream && stream.subWithMeta(name, metadata);
    } else {
      this[streamKey] = stream && stream.subs[name];
    }
  }

  getChildContext() {
    return {
      [streamKey]: this[streamKey],
      [storeKey]: this[storeKey],
    }
  }

  render() {
    return React.Children.only(this.props.children);
  }
}

Subcomponent.propTypes = {
    name: PropTypes.any.isRequired,
    metadata: PropTypes.any,
    selector: PropTypes.func.isRequired,
};
Subcomponent.childContextTypes = {
    [streamKey]: PropTypes.any.isRequired,
    [storeKey]: PropTypes.any.isRequired,
};
Subcomponent.contextTypes = {
    [streamKey]: PropTypes.any.isRequired,
    [storeKey]: PropTypes.any.isRequired,
};
