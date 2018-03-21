import React from 'react';
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
export function tanokComponent(target) {
  target.propTypes = target.propTypes || {};
  target.propTypes.tanokStream = PropTypes.instanceOf(StreamWrapper);

  target.displayName = `TanokComponent(${target.displayName || target.name})`;

  target.prototype.send = function send(action, payload, metadata = null) {
    if (metadata !== null) {
      console.error('Hey! You no longer can pass metadata `.send()`, use `.sub()`');
    }

    const stream = this.props.tanokStream;
    stream.send(action, payload);
  };

  target.prototype.sub = function sub(name, metadata = null) {
    const stream = this.props.tanokStream;
    return stream && stream.subWithMeta(`${stream.streamName}.${name}`, metadata);
  };

  return target;
}
