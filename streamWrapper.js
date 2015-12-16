import {actionIs} from './helpers.js';

function maybeWrapArray(something) {
  return Array.isArray(something) ? something : [something];
}

function isFunction(x) {
  return Object.prototype.toString.call(x) == '[object Function]';
}

function maybeWrapActionIs(condition) {
  return isFunction(condition) ? condition : actionIs(condition)
}

export class StreamWrapper {
  constructor (stream, parent) {
    this.stream = stream;
    this.parent = parent;
    this.disposable = null;
  };

  dispatch (updateHandlers) {
    let parentStream = this.stream.filter(({parent}) => parent === this.parent)

    let dispatcherArray = updateHandlers.map(([actionCondition, actionHandler]) =>
      maybeWrapArray(actionCondition)
        .reduce((accStream, cond) => maybeWrapActionIs(cond).call(accStream), parentStream)
        .map((params) => (state) => actionHandler(params, state)))

    return Rx.Observable.merge(...dispatcherArray);
  }

  subStream (parent, subUpdate) {
    let subStreamWrapper = new StreamWrapper(this.stream, parent);

    this.disposable = subStreamWrapper
      .dispatch(subUpdate)
      .do((stateMutator) => this.send(parent, stateMutator))
      .subscribe(
        Rx.helpers.noop,
        console.error.bind(console)
      );

    return subStreamWrapper;
  }

  send (action, payload) {
    this.stream.onNext({action, payload, parent: this.parent})
  }
}
