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
