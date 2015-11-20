import {StreamWrapper} from './streamWrapper.js'

export function actionIs(actionName) {
  return function() {return this.filter(({action}) => action === actionName)};
}

export function parentIs(parentName) {
  return function() {return this.filter(({parent}) => parent === parentName)};
}

export function filter(cond) {
  return function() {return this.filter(cond)}
}

export function debounce(time) {
  return function() { return this.debounce(time)}
}

export function effectWrapper(effect, parent) {
  return (state, {stream}) => effect
    ? effect(state, new StreamWrapper(stream, parent))
    : Rx.helpers.noop
}
