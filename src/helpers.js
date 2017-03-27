export function actionIs(actionName) {
  return function () {
    return this.filter(({action}) => action === actionName);
  };
}

export function parentIs(awaitedName) {
  console.warning('This function is deprecated, use `nameIs` instead')
  return function () {
    return this.filter(({streamName}) => streamName === awaitedName);
  };
}

export function nameIs(awaitedName) {
  return function () {
    return this.filter(({streamName}) => streamName === awaitedName);
  };
}

export function filter(cond) {
  return function () {
    return this.filter(cond);
  };
}

export function debounce(time) {
  return function () {
    return this.debounce(time);
  };
}

export function throttle(time) {
  return function () {
    return this.throttle(time);
  };
}

export function rethrowFx(action, payload, metadata) {
  return function (stream) {
    stream.send(action, payload, metadata)
  }
}

export function subcomponentFx(subName, dispatchSub) {
  return function (stream) {
    stream.subStream(subName, dispatchSub)
  }
}
