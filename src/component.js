import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { StreamWrapper } from './streamWrapper.js';

/**
 * Decorator used with class-based React components.
 * It provides all the required props and helpers for tanok internals.
 *
 * Usage example:
 *
 * @tanokComponent
 * class MyComponent extends React.Component {
 *    ... your component methods.
 * }
 *
 * */
export function tanokComponent(WrappedComponent) {
  class TanokComponent extends Component {
    constructor(props, context) {
      super(props, context);
      this.send = this.send.bind(this);
    }

    send(action, payload) {
      this.context.tanokStream.send(action, payload);
    }

    render() {
      return (
        <WrappedComponent
          {...this.props}
          send={this.send}
        />
      );
    }
  }
  WrappedComponent.propTypes = WrappedComponent.propTypes || {};
  WrappedComponent.propTypes.send = PropTypes.func.isRequired;
  TanokComponent.displayName = `TanokComponent(${WrappedComponent.displayName || WrappedComponent.name})`;
  TanokComponent.contextTypes = {
    tanokStream: PropTypes.instanceOf(StreamWrapper),
  };

  return TanokComponent;
}