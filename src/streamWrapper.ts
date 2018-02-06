import Rx from 'rx';
import { actionIs, PredicateReturnType, PredicateInterface } from './helpers.js';

const WRONG_UPDATE_HANDLER = 'Dispatcher must be subclass of TanokDispatcher or iterable';

function isIterable (object: any): boolean {
  return object != null && typeof object[Symbol.iterator] === 'function';
}

function isFunction(x): x is () => any {
  return Object.prototype.toString.call(x) === '[object Function]';
}

function maybeWrapActionIs(condition: PredicateReturnType | string): PredicateReturnType {
  return isFunction(condition) ? condition : actionIs(condition);
}

function commonDispatch(stream: Rx.Observable<PayloadInterface>, updateHandlers, filterName: string, mapperFn): Rx.Observable<PayloadInterface> {
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

export function dispatch(stream: Rx.Observable<PayloadInterface>, updateHandlers, filterName: string): Rx.Observable<PayloadInterface> {
  return commonDispatch(
    stream, updateHandlers, filterName,
    (actionHandler) => (params) => (state) => {
      const actionResult = actionHandler(params.payload, state, params);
      const newState = actionResult[0];
      const effects = actionResult.slice(1);
      return {state: newState, effects, params};
  })
}

function dispatchSub(stream: Rx.Observable<PayloadInterface>, updateHandlers, filterName: string): Rx.Observable<PayloadInterface> {
  return commonDispatch(
    stream, updateHandlers, filterName,
    (actionHandler) => (params) => {
      return [(state) => actionHandler(params.payload, state, params), params];
    }
  )
}

type Effect = (stream: StreamWrapper) => void | Promise<void>;

export type StateMutatorInterface = <S>(payload: PayloadInterface, state: S, metadata: any) => [S, Array<Effect>];

export interface PayloadInterface {
  action: string;
  payload?: null | object | StateMutatorInterface;
  streamName: string;
  metadata: null | object;
  metadataArray: object[];
  stack: object[];
}


export class StreamWrapper {
  stream: Rx.ISubject<PayloadInterface>;
  streamName: string;
  disposable?: Rx.IDisposable;
  metadata: object[];
  subs: object;
  subsWithMeta: WeakMap<object, StreamWrapper>;

  constructor(stream, streamName) {
    this.stream = stream;
    this.streamName = streamName;
    this.disposable = null;
    this.metadata = [];
    this.subs = {};
    this.subsWithMeta = new WeakMap<object, StreamWrapper>();
  }

  subStream(subName, subUpdate) {
    const subStreamWrapper = new StreamWrapper(this.stream, subName);
    subStreamWrapper.metadata = Array.prototype.concat(this.metadata, null);
    this.subs[subName] = subStreamWrapper;

    subStreamWrapper.disposable = dispatchSub(this.stream, subUpdate, subName)
      .do((parentPayload) => {
        const stateMutator = parentPayload[0];
        const params = parentPayload[1];
        return this.stream.onNext({
          action: subName,
          payload: stateMutator,
          streamName: this.streamName,
          metadata: params.metadataArray[params.metadataArray.length - 1],
          metadataArray: params.metadataArray.slice(0, -1),
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

  send(action: string, payload?: object) {
    this.stream.onNext({
      action,
      payload,
      streamName: this.streamName,
      metadata: null,
      metadataArray: this.metadata,
      stack: [],
    });
  };

  subWithMeta(sub, metadata) {
    const subStream = this.subs[sub];
    if (!subStream) {
      return null;
    }
  
    const key = {sub, metadata};
    const storage = this.subsWithMeta;
    if (storage.has(key)) {
      return storage.get(key)
    }
  
    const mock = new StreamWrapper(subStream.stream, subStream.streamName);
    mock.metadata = this.metadata.concat(metadata);
    mock.subs = subStream.subs;
  
    storage.set(key, mock);
    return mock;
  }
}
