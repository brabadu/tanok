import React from 'react';

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
  target.propTypes.eventStream = React.PropTypes.instanceOf(StreamWrapper);
  target.propTypes.tanokStream = React.PropTypes.instanceOf(StreamWrapper);

  target.displayName = `TanokComponent(${target.displayName || target.name})`;

  target.prototype.send = function send(action, payload, metadata = null) {
    if (!this.props.tanokStream && this.props.eventStream) {
      console.error(`Use 'tanokStream' argument instead of 'eventStream' (${target.displayName})`);
    }
    const stream = this.props.tanokStream || this.props.eventStream;
    stream.send(action, payload, metadata);
  };

  target.prototype.subStream = function subStream(parent, updateHandlers) {
    console.error(`stream.subStream function is deprecated. Use subcomponentFx effect (${target.displayName})`);
    return this.props.eventStream.subStream(parent, updateHandlers);
  };

  target.prototype.sub = function sub(name) {
    if (!this.props.tanokStream && this.props.eventStream) {
      console.error(`Use 'tanokStream' argument instead of 'eventStream' (${target.displayName})`);
    }

    const stream = this.props.tanokStream || this.props.eventStream;
    return stream && stream.subs[name];
  }

  return target;
}
