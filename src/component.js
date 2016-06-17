import { StreamWrapper } from './streamWrapper.js';
import React from 'react';

export default function Wrapper(Wrapped) {
  class TanokComponent extends Wrapped {}

  TanokComponent.propTypes = TanokComponent.propTypes || {};
  TanokComponent.propTypes.eventStream = React.PropTypes.instanceOf(StreamWrapper).isRequired;

  TanokComponent.displayName = `TanokComponent(${Wrapped.displayName || Wrapped.name})`;

  TanokComponent.prototype.send = function send(action, payload, metadata = null) {
    this.props.eventStream.send(action, payload, metadata);
  };

  TanokComponent.prototype.subStream = function subStream(parent, updateHandlers) {
    return this.props.eventStream.subStream(parent, updateHandlers);
  };

  return TanokComponent;
}
