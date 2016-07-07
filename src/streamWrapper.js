import Rx from 'rx';
import { actionIs } from './helpers.js';

function maybeWrapArray(something) {
  return Array.isArray(something) ? something : [something];
}

function isFunction(x) {
  return Object.prototype.toString.call(x) === '[object Function]';
}

function maybeWrapActionIs(condition) {
  return isFunction(condition) ? condition : actionIs(condition);
}


export class StreamWrapper {
  constructor(stream, parent) {
    this.stream = stream;
    this.parent = parent;
    this.disposable = null;
    this.subs = {};
  }

  subStream(subParent, subUpdate) {
    function dispatchSub(stream, updateHandlers, filterParent) {
      const parentStream = stream.filter(({ parent }) => parent === filterParent);
      const dispatcherArray = updateHandlers.map(([actionCondition, actionHandler]) =>
        maybeWrapArray(actionCondition)
          .reduce((accStream, cond) => maybeWrapActionIs(cond).call(accStream), parentStream)
          .map((params) => {
            return [(state) => actionHandler(params.payload, state, params), params];
          }));
      return Rx.Observable.merge(...dispatcherArray);
    }

    const subStreamWrapper = new StreamWrapper(this.stream, subParent);
    this.subs[subParent] = subStreamWrapper;

    subStreamWrapper.disposable = dispatchSub(this.stream, subUpdate, subParent)
      .do(([stateMutator, params]) =>
        this.stream.onNext({
          action: subParent,
          payload: stateMutator,
          parent: this.parent,
          metadata: params.metadata,
          stack: params,
        })
      )
      .subscribe(
        Rx.helpers.noop,
        console.error.bind(console)
      );

    subStreamWrapper.send('init');

    return subStreamWrapper;
  }

  send(action, payload, metadata = null) {
    this.stream.onNext({ action, payload, parent: this.parent, metadata });
  }
}


export function dispatch(stream, updateHandlers, filterParent) {
  const parentStream = stream.filter(({ parent }) => parent === filterParent);
  const dispatcherArray = updateHandlers.map(([actionCondition, actionHandler]) =>
    maybeWrapArray(actionCondition)
      .reduce((accStream, cond) => maybeWrapActionIs(cond).call(accStream), parentStream)
      .map((params) => (state) => {
          const [newState, ...effects] = actionHandler(params.payload, state, params);
          return {state: newState, effects, params};
      }));

  return Rx.Observable.merge(...dispatcherArray);
}
