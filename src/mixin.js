import {StreamWrapper} from './streamWrapper.js';
import React from 'react';

const TanokMixin = {
  propTypes: {
    eventStream: React.PropTypes.instanceOf(StreamWrapper).isRequired
  },

  send: function (action, payload, metadata=null) {
    this.props.eventStream.send(action, payload, metadata);
  },

  subStream: function (parent, updateHandlers) {
    return this.props.eventStream.subStream(parent, updateHandlers);
  }
};

export default TanokMixin;
