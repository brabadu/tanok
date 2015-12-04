import {StreamWrapper} from './streamWrapper.js'
import React from 'react';

export default function Wrapper(Wrapped) {
  class TanokComponent extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return <Wrapped {...this.props} />;
    }
  }

  TanokComponent.propTypes = {
    eventStream: React.PropTypes.instanceOf(StreamWrapper).isRequired
  }

  Wrapped.prototype.send = function (action, payload) {
    this.props.eventStream.send(action, payload)
  };

  Wrapped.prototype.subStream = function(parent, updateHandlers) {
    return this.props.eventStream.subStream(parent, updateHandlers)
  }

  return TanokComponent
};
