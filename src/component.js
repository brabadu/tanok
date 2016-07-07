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
export default function tanokComponent(target) {
  target.propTypes = target.propTypes || {};
  target.propTypes.eventStream = React.PropTypes.instanceOf(StreamWrapper);

  target.displayName = `TanokComponent(${target.displayName || target.name})`;

  target.prototype.send = function send(action, payload, metadata = null) {
    this.props.eventStream.send(action, payload, metadata);
  };

  target.prototype.subStream = function subStream(parent, updateHandlers) {
    console.warn('stream.subStream function is deprecated. Use subcomponentFx effect.');
    return this.props.eventStream.subStream(parent, updateHandlers);
  };

  target.prototype.sub = function sub(name) {
    const stream = this.props.eventStream;
    return stream && stream.subs[name];
  }

  return target;
}
