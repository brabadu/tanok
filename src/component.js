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
  target.propTypes.eventStream = PropTypes.instanceOf(StreamWrapper);
  target.propTypes.tanokStream = PropTypes.instanceOf(StreamWrapper);

  target.displayName = `TanokComponent(${target.displayName || target.name})`;

  target.prototype.send = function send(action, payload, metadata = null) {
    if (!this.props.tanokStream && this.props.eventStream) {
      console.error(`Use 'tanokStream' argument instead of 'eventStream' (${target.displayName})`);
    }

    if (metadata !== null) {
      console.error('Hey! You no longer can pass metadata `.send()`, use `.sub()`');
    }

    const stream = this.props.tanokStream || this.props.eventStream;
    stream.send(action, payload);
  };

  target.prototype.subStream = function subStream(name, updateHandlers) {
    console.error(`stream.subStream function is deprecated. Use subcomponentFx effect (${target.displayName})`);

    const stream = this.props.tanokStream || this.props.eventStream;
    return stream.subStream(name, updateHandlers);
  };

  target.prototype.sub = function sub(name, metadata = null) {
    if (!this.props.tanokStream && this.props.eventStream) {
      console.error(`Use 'tanokStream' argument instead of 'eventStream' (${target.displayName})`);
    }

    const stream = this.props.tanokStream || this.props.eventStream;

    return stream && stream.subWithMeta(`${stream.streamName}.${name}`, metadata);
  };

  return target;
}
