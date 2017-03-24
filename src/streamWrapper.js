import Rx from 'rx';
import { actionIs } from './helpers.js';

const WRONG_UPDATE_HANDLER = 'Dispatcher must be subclass of TanokDispatcher or iterable';

function isIterable (object) {
  return object != null && typeof object[Symbol.iterator] === 'function';
}

function isFunction(x) {
  return Object.prototype.toString.call(x) === '[object Function]';
}

function maybeWrapActionIs(condition) {
  return isFunction(condition) ? condition : actionIs(condition);
}

function commonDispatch(stream, updateHandlers, filterParent, mapperFn) {
  if (!isIterable(updateHandlers)) {
    throw new Error(WRONG_UPDATE_HANDLER)
  }

  const parentStream = stream.filter(({ parent }) => parent === filterParent);
  const dispatcherArray = Array.from(updateHandlers)
    .map((actionPair) => {
      const actionCondition = actionPair[0];
      const actionHandler = actionPair[1];
      return actionCondition
        .reduce((accStream, cond) => maybeWrapActionIs(cond).call(accStream), parentStream)
        .map(mapperFn(actionHandler))
    });
  return Rx.Observable.merge.apply(undefined, dispatcherArray);
}

export function dispatch(stream, updateHandlers, filterParent) {
  return commonDispatch(
    stream, updateHandlers, filterParent,
    (actionHandler) => (params) => (state) => {
      const actionResult = actionHandler(params.payload, state, params);
      const newState = actionResult[0];
      const effects = actionResult.slice(1);
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


export const StreamWrapper = function(stream, parent) {
    this.stream = stream;
    this.parent = parent;
    this.disposable = null;
    this.subs = {};
}

StreamWrapper.prototype.subStream = function(subParent, subUpdate) {
    const subStreamWrapper = new StreamWrapper(this.stream, subParent);
    this.subs[subParent] = subStreamWrapper;

    subStreamWrapper.disposable = dispatchSub(this.stream, subUpdate, subParent)
      .do((parentPayload) => {
        const stateMutator = parentPayload[0];
        const params = parentPayload[1];
        return this.stream.onNext({
          action: subParent,
          payload: stateMutator,
          parent: this.parent,
          metadata: params.metadata,
          stack: params,
        })
      })
      .subscribe(
        Rx.helpers.noop,
        console.error.bind(console)
      );

    subStreamWrapper.send('init');

    return subStreamWrapper;
};

StreamWrapper.prototype.send = function(action, payload, metadata = null) {
    this.stream.onNext({ action, payload, parent: this.parent, metadata });
}
