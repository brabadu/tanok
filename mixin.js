import {StreamWrapper} from './streamWrapper'
import React from 'react';

const TanokMixin = {
  propTypes: {
    eventStream: React.PropTypes.instanceOf(StreamWrapper).isRequired
  },

  send: function (action, payload) {
    this.props.eventStream.send(action, payload)
  },

  subStream: function(parent, updateHandlers) {
    return this.props.eventStream.subStream(parent, updateHandlers)
  }
}

export default TanokMixin;
