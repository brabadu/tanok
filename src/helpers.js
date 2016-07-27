export function actionIs(actionName) {
  return function () {
    return this.filter(({action}) => action === actionName);
  };
}

export function parentIs(parentName) {
  return function () {
    return this.filter(({parent}) => parent === parentName);
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

export function subcomponentFx(subParent, dispatchSub) {
  return function (stream) {
    stream.subStream(subParent, dispatchSub)
  }
}
