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

function commonDispatch(stream, updateHandlers, filterName, mapperFn) {
  if (!isIterable(updateHandlers)) {
    throw new Error(WRONG_UPDATE_HANDLER)
  }

  const currentStream = stream.filter(({ streamName }) => streamName === filterName);
  const dispatcherArray = Array.from(updateHandlers)
    .map((actionPair) => {
      const actionCondition = actionPair[0];
      const actionHandler = actionPair[1];
      return actionCondition
        .reduce((accStream, cond) => maybeWrapActionIs(cond).call(accStream), currentStream)
        .map(mapperFn(actionHandler))
    });
  return Rx.Observable.merge.apply(undefined, dispatcherArray);
}

export function dispatch(stream, updateHandlers, filterName) {
  return commonDispatch(
    stream, updateHandlers, filterName,
    (actionHandler) => (params) => (state) => {
      const actionResult = actionHandler(params.payload, state, params);
      const newState = actionResult[0];
      const effects = actionResult.slice(1);
      return {state: newState, effects, params};
  })
}

function dispatchSub(stream, updateHandlers, filterName) {
  return commonDispatch(
    stream, updateHandlers, filterName,
    (actionHandler) => (params) => {
      return [(state) => actionHandler(params.payload, state, params), params];
    }
  )
}


export const StreamWrapper = function(stream, streamName) {
    this.stream = stream;
    this.streamName = streamName;
    this.disposable = null;
    this.subs = {};
}

StreamWrapper.prototype.subStream = function(subName, subUpdate) {
    const subStreamWrapper = new StreamWrapper(this.stream, subName);
    this.subs[subName] = subStreamWrapper;

    subStreamWrapper.disposable = dispatchSub(this.stream, subUpdate, subName)
      .do((parentPayload) => {
        const stateMutator = parentPayload[0];
        const params = parentPayload[1];
        return this.stream.onNext({
          action: subName,
          payload: stateMutator,
          streamName: this.streamName,
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
    this.stream.onNext({ action, payload, streamName: this.streamName, metadata });
}
