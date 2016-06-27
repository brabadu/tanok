import React from 'react';

import { StreamWrapper } from './streamWrapper.js';

/**
 * Decorator used with TanokDispatcher
 *
 * Usage example:
 *
 * class HelloWorldDispatcher extends TanokDispatcher {
 *
 *   @on('helloEvent')
 *   helloWorld (eventPayload, state) {
 *     state.word = eventPayload.word;
 *     return [state, helloWorldEffect];
 *   }
 * }
 *
 * @param predicate - action title or multiple values like @on('actionTitle', debounce(500))
 * @returns {Function}
 */
export function on(...predicate) {
  return (target, property) => {
    target.events = target.events || [];
    target.events.push([predicate, target[property]]);
  };
}


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
  target.propTypes.eventStream = React.PropTypes.instanceOf(StreamWrapper).isRequired;

  target.displayName = `TanokComponent(${target.displayName || target.name})`;

  target.prototype.send = function send(action, payload, metadata = null) {
    this.props.eventStream.send(action, payload, metadata);
  };

  target.prototype.subStream = function subStream(parent, updateHandlers) {
    return this.props.eventStream.subStream(parent, updateHandlers);
  };

  return target;
}