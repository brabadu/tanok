import Rx from 'rx';
import { actionIs } from './helpers.js';

function isFunction(x) {
  return Object.prototype.toString.call(x) === '[object Function]';
}

function maybeWrapActionIs(condition) {
  return isFunction(condition) ? condition : actionIs(condition);
}

function commonDispatch(stream, updateHandlers, filterParent, mapperFn) {
  const parentStream = stream.filter(({ parent }) => parent === filterParent);
  const dispatcherArray = Array.from(updateHandlers)
    .map(([actionCondition, actionHandler]) =>
      actionCondition
        .reduce((accStream, cond) => maybeWrapActionIs(cond).call(accStream), parentStream)
        .map(mapperFn(actionHandler)));

  return Rx.Observable.merge(...dispatcherArray);
}

export function dispatch(stream, updateHandlers, filterParent) {
  return commonDispatch(
    stream, updateHandlers, filterParent,
    (actionHandler) => (params) => (state) => {
      const [newState, ...effects] = actionHandler(params.payload, state, params);
      return {state: newState, effects, params};
  })
}

function dispatchSub(stream, updateHandlers, filterParent) {
  return commonDispatch(
    stream, updateHandlers, filterParent,
    (actionHandler) => (params) => {
      return [(state) => actionHandler(params.payload, state, params), params];
    }
  )
}

export class StreamWrapper {
  constructor(stream, parent) {
    this.stream = stream;
    this.parent = parent;
    this.disposable = null;
    this.subs = {};
  }

  subStream(subParent, subUpdate) {
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
