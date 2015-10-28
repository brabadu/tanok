export function actionIs(actionName) {
  return ({action}) => action === actionName;
}
