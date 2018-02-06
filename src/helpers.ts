import { PayloadInterface } from './streamWrapper';

export type PredicateReturnType = () => Rx.Observable<PayloadInterface>;
export type PredicateInterface = () => PredicateReturnType;

export function actionIs(actionName: string): PredicateReturnType {
  return function () : Rx.Observable<PayloadInterface> {
    return this.filter(({action}) => action === actionName);
  };
}

export function parentIs(awaitedName: string): PredicateReturnType {
  console.error('This function is deprecated, use `nameIs` instead')
  return function () {
    return this.filter(({streamName}) => streamName === awaitedName);
  };
}

export function nameIs(awaitedName: string): PredicateReturnType {
  return function () {
    return this.filter(({streamName}) => streamName === awaitedName);
  };
}

export function filter(cond: () => boolean): PredicateReturnType {
  return function () {
    return this.filter(cond);
  };
}

export function debounce(time: number): PredicateReturnType {
  return function () {
    return this.debounce(time);
  };
}

export function throttle(time: number): PredicateReturnType {
  return function () {
    return this.throttle(time);
  };
}
