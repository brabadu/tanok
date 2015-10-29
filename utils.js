export function actionIs(actionName) {
  return ({action}) => action === actionName;
}

export function filter(cond) {
  return function() {return this.filter(cond)}
}

export function debounce(time) {
  return function() { return this.debounce(time)}
}
